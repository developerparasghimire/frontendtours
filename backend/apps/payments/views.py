"""
Payment views.

The MPG flow lives entirely in this app:

  POST /api/v1/payments/mpg/initiate/   - create checkout session for a booking
  GET  /api/v1/payments/mpg/return/     - browser redirect back from MPG
  POST /api/v1/payments/mpg/webhook/    - server-to-server notification
  GET  /api/v1/payments/<order>/status/ - polled by the frontend (success page)
"""

from __future__ import annotations

import hmac
import json
import logging
from decimal import Decimal
from urllib.parse import urlencode

from django.conf import settings
from django.db import transaction as db_transaction
from django.http import HttpRequest, HttpResponse, HttpResponseRedirect
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import permissions, status, views
from rest_framework.response import Response

from apps.bookings.models import BookingStatus, EventBooking, TourBooking

from .models import PaymentStatus, PaymentTransaction
from .mpg_client import MPGAPIError, MPGClient, MPGConfigurationError
from .services import create_mpg_checkout_session, _confirm_booking

logger = logging.getLogger("payments.views")


def _frontend_redirect(path: str, **params) -> HttpResponseRedirect:
    base = (getattr(settings, "FRONTEND_URL", "") or "").rstrip("/")
    qs = f"?{urlencode(params)}" if params else ""
    return HttpResponseRedirect(f"{base}{path}{qs}")


def _user_owns_booking(user, booking_type: str, booking_id: int) -> bool:
    Model = TourBooking if booking_type.upper() == "TOUR" else EventBooking
    return Model.objects.filter(id=booking_id, user=user).exists()




# ──────────────────────────────────────────────────────────────────── INITIATE

class MPGInitiatePaymentAPI(views.APIView):
    """Create an MPG Hosted Checkout session for an existing booking."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        booking_id = request.data.get("booking_id")
        booking_type = (request.data.get("booking_type") or "").upper()

        if not booking_id or booking_type not in {"TOUR", "EVENT"}:
            return Response(
                {"detail": "booking_id and booking_type ('TOUR' or 'EVENT') are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            booking_id = int(booking_id)
        except (TypeError, ValueError):
            return Response({"detail": "booking_id must be an integer."},
                            status=status.HTTP_400_BAD_REQUEST)

        # Ownership check - never trust the client.
        if not _user_owns_booking(request.user, booking_type, booking_id):
            return Response({"detail": "Booking not found."},
                            status=status.HTTP_404_NOT_FOUND)

        origin = request.build_absolute_uri("/").rstrip("/")
        try:
            result = create_mpg_checkout_session(
                booking_id=booking_id,
                booking_type=booking_type,
                request_origin=origin,
            )
        except MPGConfigurationError as exc:
            logger.error("MPG not configured: %s", exc)
            return Response({"detail": "Payment gateway is not configured."},
                            status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except MPGAPIError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)
        except Exception:
            logger.exception("Unexpected error initiating MPG payment")
            return Response({"detail": "Failed to initiate payment."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(result, status=status.HTTP_200_OK)


# ──────────────────────────────────────────────────────────────────── RETURN

class MPGReturnView(views.APIView):
    """
    Browser redirect target after Hosted Checkout completes (or is cancelled).

    Performs:
      1. resultIndicator vs successIndicator comparison (anti-tamper).
      2. Server-to-server RETRIEVE_ORDER for authoritative status.
      3. Updates the transaction + booking atomically.
      4. Redirects the browser to the appropriate frontend page.
    """

    permission_classes = [permissions.AllowAny]
    authentication_classes: list = []

    def get(self, request: HttpRequest):
        order_id = request.GET.get("order")
        result_indicator = request.GET.get("resultIndicator", "")
        cancelled = request.GET.get("cancel") == "1"

        if not order_id:
            return _frontend_redirect("/payment/failed", reason="missing_order")

        try:
            txn = PaymentTransaction.objects.get(mpg_order_id=order_id)
        except PaymentTransaction.DoesNotExist:
            logger.warning("MPG return for unknown order_id=%s", order_id)
            return _frontend_redirect("/payment/failed", reason="unknown_order")

        if cancelled:
            self._mark_cancelled(txn)
            return _frontend_redirect("/payment/cancelled", order=order_id)

        # Tamper check - resultIndicator must match what MPG gave us at session time.
        if (
            txn.mpg_success_indicator
            and result_indicator
            and not hmac.compare_digest(txn.mpg_success_indicator, result_indicator)
        ):
            logger.warning(
                "MPG resultIndicator mismatch for order=%s (possible tampering)", order_id,
            )
            # Still call RETRIEVE_ORDER as the final source of truth.

        try:
            self._reconcile(txn)
        except Exception:
            logger.exception("Failed to reconcile MPG order %s", order_id)
            return _frontend_redirect("/payment/failed",
                                      order=order_id, reason="reconcile_error")

        txn.refresh_from_db()

        if txn.status == PaymentStatus.SUCCESS:
            # Look up the human-readable booking reference (GTN-XXXX) for the redirect
            Model = TourBooking if txn.booking_type == "TOUR" else EventBooking
            try:
                booking = Model.objects.get(id=txn.booking_reference)
                human_ref = booking.booking_reference
            except Model.DoesNotExist:
                human_ref = txn.booking_reference

            return _frontend_redirect(
                "/payment/success",
                order=order_id,
                booking=txn.booking_reference,
                ref=human_ref,
                type=txn.booking_type.lower(),
            )
        if txn.status == PaymentStatus.CANCELLED:
            return _frontend_redirect("/payment/cancelled", order=order_id)
        return _frontend_redirect("/payment/failed", order=order_id, reason=txn.status.lower())

    @staticmethod
    def _mark_cancelled(txn: PaymentTransaction) -> None:
        if txn.status in {PaymentStatus.SUCCESS, PaymentStatus.REFUNDED}:
            return
        txn.status = PaymentStatus.CANCELLED
        txn.save(update_fields=["status", "updated_at"])

    @staticmethod
    def _reconcile(txn: PaymentTransaction) -> None:
        """Idempotently sync our DB with MPG's authoritative order state."""
        with db_transaction.atomic():
            txn = PaymentTransaction.objects.select_for_update().get(pk=txn.pk)

            if txn.status in {PaymentStatus.SUCCESS, PaymentStatus.REFUNDED}:
                return  # already finalised

            client = MPGClient()
            order = client.retrieve_order(txn.mpg_order_id)
            outcome = client.order_outcome(order)

            txn.gateway_response = {**(txn.gateway_response or {}), "retrieve_order": order}

            order_amount = order.get("amount")
            order_currency = order.get("currency")
            if outcome == "SUCCESS":
                try:
                    if Decimal(str(order_amount)) != Decimal(txn.amount):
                        logger.error("MPG amount mismatch for %s: expected=%s got=%s",
                                     txn.mpg_order_id, txn.amount, order_amount)
                        outcome = "FAILED"
                    if order_currency and order_currency != txn.currency:
                        logger.error("MPG currency mismatch for %s: expected=%s got=%s",
                                     txn.mpg_order_id, txn.currency, order_currency)
                        outcome = "FAILED"
                except (TypeError, ValueError, ArithmeticError):
                    outcome = "FAILED"

            txn.status = {
                "SUCCESS": PaymentStatus.SUCCESS,
                "FAILED": PaymentStatus.FAILED,
                "CANCELLED": PaymentStatus.CANCELLED,
                "PENDING": PaymentStatus.PENDING,
            }[outcome]

            # Surface the precise gateway/acquirer reason for failed payments so
            # support can diagnose without shell access (visible in Django admin
            # → PaymentTransaction → gateway_response).
            if outcome in {"FAILED", "CANCELLED"}:
                txns = order.get("transaction") or []
                last_resp = (txns[-1].get("response") if txns else {}) or {}
                last_txn_obj = (txns[-1].get("transaction") if txns else {}) or {}
                failure_reason = {
                    "gatewayCode": last_resp.get("gatewayCode"),
                    "gatewayRecommendation": last_resp.get("gatewayRecommendation"),
                    "acquirerCode": last_resp.get("acquirerCode"),
                    "acquirerMessage": last_resp.get("acquirerMessage"),
                    "result": order.get("result"),
                    "status": order.get("status"),
                    "transaction_type": last_txn_obj.get("type"),
                }
                txn.gateway_response = {
                    **(txn.gateway_response or {}),
                    "failure_reason": failure_reason,
                }
                logger.warning(
                    "MPG payment %s for order=%s reason=%s",
                    outcome, txn.mpg_order_id, failure_reason,
                )

            if outcome == "SUCCESS":
                txns = order.get("transaction") or []
                if txns:
                    txn.transaction_id = (
                        txns[-1].get("transaction", {}).get("id") or txn.mpg_order_id
                    )
                else:
                    txn.transaction_id = txn.mpg_order_id
                _confirm_booking(txn, payment_reference=txn.transaction_id)

            txn.save(update_fields=[
                "status", "transaction_id", "gateway_response", "updated_at"
            ])


# ──────────────────────────────────────────────────────────────────── WEBHOOK

@method_decorator(csrf_exempt, name="dispatch")
class MPGWebhookView(views.APIView):
    """Server-to-server payment notification handler. Idempotent."""

    permission_classes = [permissions.AllowAny]
    authentication_classes: list = []

    def post(self, request: HttpRequest):
        client = MPGClient()
        signature = (
            request.headers.get("X-Notification-Secret")
            or request.headers.get("X-Notification-Signature")
            or ""
        )

        if not client.verify_webhook_signature(request.body, signature):
            logger.warning("Rejected MPG webhook (bad signature) from %s",
                           request.META.get("REMOTE_ADDR"))
            return HttpResponse("invalid signature", status=403)

        try:
            payload = json.loads(request.body or b"{}")
        except json.JSONDecodeError:
            return HttpResponse("invalid json", status=400)

        order_id = ((payload.get("order") or {}).get("id") or payload.get("orderId"))
        if not order_id:
            return HttpResponse("missing order id", status=400)

        try:
            with db_transaction.atomic():
                try:
                    txn = (PaymentTransaction.objects
                           .select_for_update()
                           .get(mpg_order_id=order_id))
                except PaymentTransaction.DoesNotExist:
                    logger.error("Webhook for unknown MPG order_id=%s", order_id)
                    return HttpResponse(status=404)

                # Already finalised -> ack to stop retries.
                if txn.status in {PaymentStatus.SUCCESS, PaymentStatus.REFUNDED, PaymentStatus.CANCELLED}:
                    return HttpResponse(status=200)

                # Always re-fetch authoritative state. Never trust webhook body alone.
                order = client.retrieve_order(order_id)
                outcome = client.order_outcome(order)

                txn.gateway_response = {
                    **(txn.gateway_response or {}),
                    "webhook": payload,
                    "retrieve_order": order,
                }

                if outcome == "SUCCESS":
                    if Decimal(str(order.get("amount", "0"))) != Decimal(txn.amount):
                        logger.error("Webhook amount mismatch for %s", order_id)
                        txn.status = PaymentStatus.FAILED
                    else:
                        txn.status = PaymentStatus.SUCCESS
                        txns = order.get("transaction") or []
                        txn.transaction_id = (
                            txns[-1].get("transaction", {}).get("id") if txns else order_id
                        )
                        _confirm_booking(txn, payment_reference=txn.transaction_id)
                elif outcome == "FAILED":
                    txn.status = PaymentStatus.FAILED
                elif outcome == "CANCELLED":
                    txn.status = PaymentStatus.CANCELLED

                txn.save(update_fields=[
                    "status", "transaction_id", "gateway_response", "updated_at"
                ])
        except MPGAPIError:
            logger.exception("MPG verification failed during webhook for %s", order_id)
            return HttpResponse(status=500)  # let MPG retry
        except Exception:
            logger.exception("Unhandled webhook error for %s", order_id)
            return HttpResponse(status=500)

        return HttpResponse(status=200)


# ──────────────────────────────────────────────────────────────────── STATUS

class PaymentStatusAPI(views.APIView):
    """Polled by the frontend success page until the webhook lands (authenticated users)."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, order_id: str):
        txn = get_object_or_404(PaymentTransaction, mpg_order_id=order_id, user=request.user)
        return Response(_txn_status_payload(txn))


class GuestPaymentStatusAPI(views.APIView):
    """
    Polled by the frontend success page for guest bookings.
    Lookup is by the human-readable booking reference (GTN-XXXX) passed in the URL.
    No authentication required — the booking reference is the secret.
    """
    permission_classes = [permissions.AllowAny]
    authentication_classes: list = []

    def get(self, request):
        booking_ref = request.GET.get("ref", "").strip().upper()
        if not booking_ref:
            return Response({"detail": "ref query parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Look up via booking_reference on TourBooking or EventBooking
        txn = None
        for Model in (TourBooking, EventBooking):
            try:
                booking = Model.objects.get(booking_reference=booking_ref)
                txn = PaymentTransaction.objects.filter(
                    booking_reference=str(booking.id),
                    booking_type="TOUR" if Model == TourBooking else "EVENT",
                ).order_by("-created_at").first()
                if txn:
                    break
            except Model.DoesNotExist:
                continue

        if not txn:
            return Response({"detail": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)

        return Response(_txn_status_payload(txn))


def _txn_status_payload(txn: PaymentTransaction) -> dict:
    return {
        "order_id": txn.mpg_order_id,
        "transaction_id": txn.transaction_id,
        "status": txn.status,
        "amount": str(txn.amount),
        "currency": txn.currency,
        "booking_type": txn.booking_type,
        "booking_id": txn.booking_reference,
        "gateway": txn.gateway,
    }
