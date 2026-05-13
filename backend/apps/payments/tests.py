"""
Tests for the MPG (Mastercard Payment Gateway / Fingent) integration.

We mock the network layer so tests run without real credentials.
"""

from __future__ import annotations

import hashlib
import hmac
import json
from datetime import timedelta
from decimal import Decimal
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient

from apps.bookings.models import BookingStatus, TourBooking
from apps.tours.models import Tour

from .models import PaymentGateway, PaymentStatus, PaymentTransaction


User = get_user_model()


MPG_TEST_SETTINGS = dict(
    MPG_GATEWAY_URL="https://test.gateway.example.com",
    MPG_MERCHANT_ID="9104535224",
    MPG_API_PASSWORD="test-password",
    MPG_WEBHOOK_SECRET="test-secret",
    MPG_API_VERSION="100",
    MPG_CURRENCY="USD",
    BACKEND_PUBLIC_URL="https://api.test.local",
    FRONTEND_URL="https://app.test.local",
)


def _make_user(email="test@example.com"):
    return User.objects.create_user(
        username=email.split("@")[0], email=email, password="pw-strong-123"
    )


def _make_tour():
    return Tour.objects.create(
        title="Annapurna Sunrise",
        slug="annapurna-sunrise",
        description="d",
        base_price=Decimal("125.00"),
        currency="USD",
        duration_days=2,
        max_capacity=20,
    )


def _make_booking(user, tour):
    return TourBooking.objects.create(
        user=user,
        tour=tour,
        travel_date=timezone.now().date() + timedelta(days=10),
        persons=2,
        total_amount=Decimal("250.00"),
        currency="USD",
    )


@override_settings(**MPG_TEST_SETTINGS)
class MPGInitiateAPITests(TestCase):
    def setUp(self):
        self.user = _make_user()
        self.tour = _make_tour()
        self.booking = _make_booking(self.user, self.tour)
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    @patch("apps.payments.mpg_client.MPGClient._request")
    def test_initiate_creates_session_and_transaction(self, mock_req):
        mock_req.return_value = {
            "result": "SUCCESS",
            "session": {"id": "SESSION-ABC", "version": "1.0.0"},
            "successIndicator": "indicator-xyz",
        }
        res = self.client.post(
            reverse("payment-mpg-initiate"),
            {"booking_id": self.booking.id, "booking_type": "TOUR"},
            format="json",
        )
        self.assertEqual(res.status_code, 200, res.content)
        body = res.json()
        self.assertIn("payment_url", body)
        self.assertIn("SESSION-ABC", body["payment_url"])

        txn = PaymentTransaction.objects.get(mpg_session_id="SESSION-ABC")
        self.assertEqual(txn.status, PaymentStatus.INITIATED)
        self.assertEqual(txn.gateway, PaymentGateway.MPG)
        self.assertEqual(txn.mpg_success_indicator, "indicator-xyz")

    def test_initiate_rejects_other_users_booking(self):
        other = _make_user("other@example.com")
        self.client.force_authenticate(other)
        res = self.client.post(
            reverse("payment-mpg-initiate"),
            {"booking_id": self.booking.id, "booking_type": "TOUR"},
            format="json",
        )
        self.assertEqual(res.status_code, 404)

    def test_initiate_validates_payload(self):
        res = self.client.post(
            reverse("payment-mpg-initiate"),
            {"booking_id": "not-a-number", "booking_type": "TOUR"},
            format="json",
        )
        self.assertEqual(res.status_code, 400)


@override_settings(**MPG_TEST_SETTINGS)
class MPGReturnViewTests(TestCase):
    def setUp(self):
        self.user = _make_user()
        self.tour = _make_tour()
        self.booking = _make_booking(self.user, self.tour)
        self.txn = PaymentTransaction.objects.create(
            user=self.user,
            booking_reference=str(self.booking.id),
            booking_type="TOUR",
            amount=self.booking.total_amount,
            currency="USD",
            gateway=PaymentGateway.MPG,
            status=PaymentStatus.INITIATED,
            mpg_order_id="ORDER-123",
            mpg_session_id="SESSION-ABC",
            mpg_success_indicator="indicator-xyz",
        )
        self.client = APIClient()

    @patch("apps.payments.mpg_client.MPGClient.retrieve_order")
    def test_successful_return_marks_paid_and_confirms_booking(self, mock_retrieve):
        mock_retrieve.return_value = {
            "result": "SUCCESS",
            "status": "CAPTURED",
            "amount": "250.00",
            "currency": "USD",
            "transaction": [{"transaction": {"id": "TXN-7"}}],
        }
        res = self.client.get(
            reverse("payment-mpg-return"),
            {"order": "ORDER-123", "resultIndicator": "indicator-xyz"},
        )
        self.assertEqual(res.status_code, 302)
        self.assertIn("/payment/success", res["Location"])
        self.txn.refresh_from_db()
        self.booking.refresh_from_db()
        self.assertEqual(self.txn.status, PaymentStatus.SUCCESS)
        self.assertEqual(self.txn.transaction_id, "TXN-7")
        self.assertEqual(self.booking.status, BookingStatus.CONFIRMED)
        self.assertEqual(self.booking.payment_reference, "TXN-7")

    @patch("apps.payments.mpg_client.MPGClient.retrieve_order")
    def test_amount_mismatch_marks_failed(self, mock_retrieve):
        mock_retrieve.return_value = {
            "result": "SUCCESS",
            "status": "CAPTURED",
            "amount": "1.00",  # tampered
            "currency": "USD",
        }
        res = self.client.get(
            reverse("payment-mpg-return"),
            {"order": "ORDER-123", "resultIndicator": "indicator-xyz"},
        )
        self.assertEqual(res.status_code, 302)
        self.assertIn("/payment/failed", res["Location"])
        self.txn.refresh_from_db()
        self.assertEqual(self.txn.status, PaymentStatus.FAILED)

    def test_cancel_redirects_and_marks_cancelled(self):
        res = self.client.get(
            reverse("payment-mpg-return"),
            {"order": "ORDER-123", "cancel": "1"},
        )
        self.assertEqual(res.status_code, 302)
        self.assertIn("/payment/cancelled", res["Location"])
        self.txn.refresh_from_db()
        self.assertEqual(self.txn.status, PaymentStatus.CANCELLED)

    def test_unknown_order_redirects_to_failure(self):
        res = self.client.get(reverse("payment-mpg-return"), {"order": "nope"})
        self.assertEqual(res.status_code, 302)
        self.assertIn("reason=unknown_order", res["Location"])


@override_settings(**MPG_TEST_SETTINGS)
class MPGWebhookTests(TestCase):
    def setUp(self):
        self.user = _make_user()
        self.tour = _make_tour()
        self.booking = _make_booking(self.user, self.tour)
        self.txn = PaymentTransaction.objects.create(
            user=self.user,
            booking_reference=str(self.booking.id),
            booking_type="TOUR",
            amount=self.booking.total_amount,
            currency="USD",
            gateway=PaymentGateway.MPG,
            status=PaymentStatus.INITIATED,
            mpg_order_id="ORDER-W1",
        )
        self.client = APIClient()

    def _signed(self, body: bytes) -> str:
        return hmac.new(b"test-secret", body, hashlib.sha256).hexdigest()

    def test_webhook_rejects_bad_signature(self):
        body = json.dumps({"order": {"id": "ORDER-W1"}}).encode()
        res = self.client.post(
            reverse("payment-mpg-webhook"),
            data=body,
            content_type="application/json",
            HTTP_X_NOTIFICATION_SECRET="wrong",
        )
        self.assertEqual(res.status_code, 403)

    @patch("apps.payments.mpg_client.MPGClient.retrieve_order")
    def test_webhook_success_confirms_booking(self, mock_retrieve):
        mock_retrieve.return_value = {
            "result": "SUCCESS",
            "status": "CAPTURED",
            "amount": "250.00",
            "currency": "USD",
            "transaction": [{"transaction": {"id": "TXN-W"}}],
        }
        body = json.dumps({"order": {"id": "ORDER-W1"}}).encode()
        res = self.client.post(
            reverse("payment-mpg-webhook"),
            data=body,
            content_type="application/json",
            HTTP_X_NOTIFICATION_SECRET=self._signed(body),
        )
        self.assertEqual(res.status_code, 200)
        self.txn.refresh_from_db()
        self.booking.refresh_from_db()
        self.assertEqual(self.txn.status, PaymentStatus.SUCCESS)
        self.assertEqual(self.booking.status, BookingStatus.CONFIRMED)

    @patch("apps.payments.mpg_client.MPGClient.retrieve_order")
    def test_webhook_is_idempotent(self, mock_retrieve):
        self.txn.status = PaymentStatus.SUCCESS
        self.txn.save(update_fields=["status"])
        body = json.dumps({"order": {"id": "ORDER-W1"}}).encode()
        res = self.client.post(
            reverse("payment-mpg-webhook"),
            data=body,
            content_type="application/json",
            HTTP_X_NOTIFICATION_SECRET=self._signed(body),
        )
        self.assertEqual(res.status_code, 200)
        mock_retrieve.assert_not_called()


@override_settings(**MPG_TEST_SETTINGS)
class PaymentStatusAPITests(TestCase):
    def setUp(self):
        self.user = _make_user()
        self.tour = _make_tour()
        self.booking = _make_booking(self.user, self.tour)
        self.txn = PaymentTransaction.objects.create(
            user=self.user,
            booking_reference=str(self.booking.id),
            booking_type="TOUR",
            amount=self.booking.total_amount,
            currency="USD",
            gateway=PaymentGateway.MPG,
            status=PaymentStatus.SUCCESS,
            mpg_order_id="ORDER-S1",
            transaction_id="TXN-S1",
        )
        self.client = APIClient()

    def test_owner_can_read_status(self):
        self.client.force_authenticate(self.user)
        res = self.client.get(reverse("payment-status", args=["ORDER-S1"]))
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["status"], "SUCCESS")
        self.assertEqual(res.json()["transaction_id"], "TXN-S1")

    def test_other_user_cannot_read_status(self):
        other = _make_user("other2@example.com")
        self.client.force_authenticate(other)
        res = self.client.get(reverse("payment-status", args=["ORDER-S1"]))
        self.assertEqual(res.status_code, 404)
