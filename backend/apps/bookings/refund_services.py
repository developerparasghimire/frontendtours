"""
Booking cancellation + refund service.

Calls the MPG REST API to actually reverse the payment, then marks the booking
as REFUNDED and restores capacity. Idempotent: a second call is a no-op.

Permissions are enforced at the view layer (`IsOwnerOrAdmin`), but we
defensively re-check ownership here too so the service is safe to call from
admin actions, signals, or scripts.
"""

from __future__ import annotations

import logging
from decimal import Decimal

from django.core.exceptions import PermissionDenied, ValidationError
from django.db import transaction
from django.db.models import F

from apps.payments.models import PaymentStatus, PaymentTransaction
from apps.payments.mpg_client import MPGAPIError, MPGClient, MPGConfigurationError

from .models import BookingStatus, EventBooking, TourBooking

logger = logging.getLogger("bookings")

# Statuses for which a refund makes sense.
_REFUNDABLE = {BookingStatus.CONFIRMED, BookingStatus.COMPLETED}


def _check_owner_or_admin(user, booking) -> None:
    """Raise PermissionDenied if user can't refund this booking."""
    if user is None:
        raise PermissionDenied("Authentication required.")
    if user.is_staff or user.is_superuser:
        return
    if booking.user_id and booking.user_id == user.id:
        return
    raise PermissionDenied("You do not have permission to refund this booking.")


def _gateway_refund(booking) -> None:
    """Locate the successful PaymentTransaction for this booking and call MPG REFUND.

    Raises ValidationError on configuration / API errors so the calling view
    returns a useful 4xx instead of a 500.
    """
    booking_type = "TOUR" if isinstance(booking, TourBooking) else "EVENT"
    txn = (
        PaymentTransaction.objects
        .filter(
            booking_type=booking_type,
            booking_reference=str(booking.id),
            status=PaymentStatus.SUCCESS,
        )
        .order_by("-created_at")
        .first()
    )
    if txn is None:
        # Nothing to refund at the gateway — e.g. comp booking or manual entry.
        logger.warning(
            "Refund requested for booking %s but no SUCCESS PaymentTransaction found.",
            booking.booking_reference,
        )
        return

    if not txn.mpg_order_id:
        raise ValidationError(
            "Original payment is missing gateway identifiers; refund must be processed manually."
        )

    client = MPGClient()
    try:
        response = client.refund(
            order_id=txn.mpg_order_id,
            transaction_id=f"refund-{txn.id}",
            amount=Decimal(booking.total_amount),
            currency=booking.currency,
        )
    except MPGConfigurationError as exc:
        raise ValidationError(f"Payment gateway not configured: {exc}") from exc
    except MPGAPIError as exc:
        logger.error("MPG refund failed for booking %s: %s", booking.booking_reference, exc)
        raise ValidationError(f"Gateway refund failed: {exc}") from exc

    txn.status = PaymentStatus.REFUNDED
    txn.gateway_response = response
    txn.save(update_fields=["status", "gateway_response", "updated_at"])
    logger.info("MPG refund OK for booking %s (txn %s).", booking.booking_reference, txn.id)


@transaction.atomic
def cancel_and_refund_tour(user, booking_id: int) -> TourBooking:
    try:
        booking = TourBooking.objects.select_for_update().get(id=booking_id)
    except TourBooking.DoesNotExist:
        raise ValidationError("Booking not found.")

    _check_owner_or_admin(user, booking)

    # Idempotent: if already cancelled/refunded, just return current state.
    if booking.status in {BookingStatus.CANCELLED, BookingStatus.REFUNDED}:
        return booking

    if booking.status not in _REFUNDABLE:
        raise ValidationError(
            f"Only confirmed or completed bookings can be refunded (current: {booking.status})."
        )

    _gateway_refund(booking)

    booking.status = BookingStatus.REFUNDED
    booking.is_refunded = True
    booking.save(update_fields=["status", "is_refunded", "updated_at"])
    # Tour capacity is computed from active bookings on each request, so a
    # REFUNDED booking is automatically excluded — no separate restore needed.
    return booking


@transaction.atomic
def cancel_and_refund_event(user, booking_id: int) -> EventBooking:
    try:
        booking = EventBooking.objects.select_for_update().get(id=booking_id)
    except EventBooking.DoesNotExist:
        raise ValidationError("Booking not found.")

    _check_owner_or_admin(user, booking)

    if booking.status in {BookingStatus.CANCELLED, BookingStatus.REFUNDED}:
        return booking

    if booking.status not in _REFUNDABLE:
        raise ValidationError(
            f"Only confirmed or completed bookings can be refunded (current: {booking.status})."
        )

    _gateway_refund(booking)

    booking.status = BookingStatus.REFUNDED
    booking.is_refunded = True
    booking.save(update_fields=["status", "is_refunded", "updated_at"])

    # Restore tickets capacity (F() = single atomic UPDATE, no read-modify-write race).
    type(booking.event).objects.filter(id=booking.event_id).update(
        available_tickets=F("available_tickets") + booking.tickets,
    )
    return booking
