"""
Payment services.

Each gateway exposes a `create_checkout_session(...)` style function that:
  * Loads the booking,
  * Creates a `PaymentTransaction` row (idempotency anchor + audit log),
  * Calls the gateway,
  * Returns a dict with at minimum {"payment_url": str, "transaction_id": int}.

`initiate_payment` is the dispatcher used by the booking views.
"""

from __future__ import annotations

import logging
import secrets
from decimal import Decimal
from typing import Any, Dict, Optional
from urllib.parse import urlencode

from django.conf import settings
from django.urls import reverse

from apps.bookings.models import BookingStatus, EventBooking, TourBooking

from .models import PaymentGateway, PaymentStatus, PaymentTransaction
from .mpg_client import MPGAPIError, MPGClient, MPGConfigurationError

logger = logging.getLogger("payments.services")



def _confirm_booking(txn: PaymentTransaction, payment_reference: str) -> None:
    """Mark the related booking as CONFIRMED. Idempotent. Sends confirmation email."""
    Model = TourBooking if txn.booking_type == "TOUR" else EventBooking
    try:
        booking = Model.objects.select_for_update().get(id=txn.booking_reference)
    except Model.DoesNotExist:
        logger.error("Payment %s references missing booking %s/%s",
                     txn.id, txn.booking_type, txn.booking_reference)
        return
    if booking.status not in {BookingStatus.CONFIRMED, BookingStatus.COMPLETED}:
        booking.status = BookingStatus.CONFIRMED
        booking.payment_reference = payment_reference
        booking.save(update_fields=["status", "payment_reference", "updated_at"])
        try:
            from apps.bookings.email_service import queue_booking_emails
            queue_booking_emails(txn.booking_type, booking)
        except Exception:
            logger.exception("Failed to queue booking emails for %s", booking.booking_reference)


def _load_booking(booking_id: int, booking_type: str):
    booking_type = (booking_type or "").upper()
    if booking_type == "TOUR":
        booking = TourBooking.objects.select_related("tour", "user").get(id=booking_id)
        title = booking.tour.title
    elif booking_type == "EVENT":
        booking = EventBooking.objects.select_related("event", "user").get(id=booking_id)
        title = booking.event.title
    else:
        raise ValueError(f"Unsupported booking_type: {booking_type!r}")
    return booking, title


def _generate_order_id(prefix: str, booking_id: int) -> str:
    # Unique, URL-safe, < 40 chars (MPG limit is 40 for order.id).
    return f"{prefix}-{booking_id}-{secrets.token_hex(6)}"


# ─────────────────────────────────────────── MPG (Mastercard Hosted Checkout) ──

def create_mpg_checkout_session(
    *,
    booking_id: int,
    booking_type: str,
    request_origin: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Initiate a Hosted Checkout session and return the URL the browser must visit.

    The `successIndicator` returned by MPG is stored in the transaction row and
    later compared against the `resultIndicator` query param sent in the browser
    redirect, providing tamper-evidence.
    """
    booking, title = _load_booking(booking_id, booking_type)
    client = MPGClient()
    # Use the currency the customer chose at booking time (USD or NPR), not
    # the gateway client default. This is critical because Nepali cards must
    # be charged in NPR per NRB rules.
    currency = (booking.currency or client.currency).upper()

    order_id = _generate_order_id(prefix=booking_type[:1], booking_id=booking.id)

    txn = PaymentTransaction.objects.create(
        user=booking.user,
        booking_reference=str(booking.id),
        booking_type=booking_type.upper(),
        amount=Decimal(booking.total_amount),
        currency=currency,
        gateway=PaymentGateway.MPG,
        status=PaymentStatus.PENDING,
        mpg_order_id=order_id,
    )

    # ── Free booking shortcut ──────────────────────────────────────────────────
    # Payment gateways reject 0-amount transactions. Confirm the booking
    # immediately and return a direct success redirect instead of calling MPG.
    if Decimal(booking.total_amount) == Decimal("0.00"):
        txn.status = PaymentStatus.SUCCESS
        txn.transaction_id = order_id
        txn.gateway_response = {"free_booking": True}
        txn.save(update_fields=["status", "transaction_id", "gateway_response", "updated_at"])
        _confirm_booking(txn, payment_reference=order_id)

        frontend_base = (getattr(settings, "FRONTEND_URL", "") or "").rstrip("/")
        qs = urlencode({
            "order": order_id,
            "booking": str(booking.id),
            "ref": booking.booking_reference,
            "type": booking_type.lower(),
        })
        payment_url = f"{frontend_base}/payment/success?{qs}"
        return {
            "transaction_id": txn.id,
            "order_id": order_id,
            "session_id": None,
            "payment_url": payment_url,
            "amount": str(txn.amount),
            "currency": txn.currency,
        }
    # ──────────────────────────────────────────────────────────────────────────

    # Build the absolute return URL so MPG can redirect the user back.
    base = (request_origin or settings.BACKEND_PUBLIC_URL).rstrip("/")
    return_url = f"{base}{reverse('payment-mpg-return')}?{urlencode({'order': order_id})}"
    cancel_url = f"{base}{reverse('payment-mpg-return')}?{urlencode({'order': order_id, 'cancel': '1'})}"

    try:
        response = client.create_checkout_session(
            order_id=order_id,
            amount=Decimal(booking.total_amount),
            return_url=return_url,
            cancel_url=cancel_url,
            description=f"{booking_type.title()} booking #{booking.id} - {title}",
            currency=currency,
        )
    except (MPGAPIError, MPGConfigurationError) as exc:
        txn.status = PaymentStatus.FAILED
        txn.gateway_response = {"error": str(exc)}
        txn.save(update_fields=["status", "gateway_response", "updated_at"])
        logger.exception("MPG session creation failed for booking %s", booking.id)
        raise

    session = response.get("session") or {}
    session_id = session.get("id")
    success_indicator = response.get("successIndicator")

    if not session_id:
        txn.status = PaymentStatus.FAILED
        txn.gateway_response = response
        txn.save(update_fields=["status", "gateway_response", "updated_at"])
        raise MPGAPIError("MPG did not return a session id")

    txn.mpg_session_id = session_id
    txn.mpg_success_indicator = success_indicator or ""
    txn.status = PaymentStatus.INITIATED
    txn.gateway_response = {"create_session": response}
    txn.save(update_fields=[
        "mpg_session_id", "mpg_success_indicator", "status", "gateway_response", "updated_at"
    ])

    payment_url = (
        f"{client.gateway_url}/checkout/pay/{session_id}"
        f"?checkoutVersion={session.get('version', '1.0.0')}"
    )

    return {
        "transaction_id": txn.id,
        "order_id": order_id,
        "session_id": session_id,
        "payment_url": payment_url,
        "amount": str(txn.amount),
        "currency": txn.currency,
    }


# ────────────────────────────────────────────────────────────────── Dispatcher ──

def initiate_payment(
    *,
    gateway: str,
    booking_id: int,
    booking_type: str,
    success_url: str = "",
    cancel_url: str = "",
    request_origin: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Dispatch a payment intent to the correct gateway.

    Currently only MPG (Mastercard Payment Gateway) is supported.
    """
    gateway = (gateway or PaymentGateway.MPG).upper()

    if gateway == PaymentGateway.MPG:
        return create_mpg_checkout_session(
            booking_id=booking_id,
            booking_type=booking_type,
            request_origin=request_origin,
        )
    raise ValueError(f"Unsupported gateway: {gateway}")

