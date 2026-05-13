"""
MPG (Mastercard Payment Gateway Services / Fingent MPG) REST client.

Implements the Hosted Checkout flow:
  1. INITIATE_CHECKOUT -> create a checkout session, get sessionId + successIndicator.
  2. Browser is redirected to the Hosted Checkout page with the sessionId.
  3. After payment MPG redirects to the merchant returnUrl with `resultIndicator`.
  4. Server compares resultIndicator to the stored successIndicator (anti-tamper)
     AND calls RETRIEVE_ORDER for the authoritative payment status.

Reference:
  - Fingent docs:    https://mpgs.fingent.wiki/
  - Underlying API:  Mastercard Payment Gateway Services REST API (Hosted Checkout)

Authentication is HTTP Basic with:
  username = "merchant.<MERCHANT_ID>"
  password = MPG_API_PASSWORD
"""

from __future__ import annotations

import hashlib
import hmac
import logging
from decimal import Decimal
from typing import Any, Dict, Optional
from urllib.parse import urljoin

import requests
from django.conf import settings

logger = logging.getLogger("payments.mpg")


class MPGConfigurationError(RuntimeError):
    """Raised when MPG settings are missing or invalid."""


class MPGAPIError(RuntimeError):
    """Raised when an MPG REST call returns a non-success response."""

    def __init__(self, message: str, status_code: Optional[int] = None, payload: Optional[dict] = None):
        super().__init__(message)
        self.status_code = status_code
        self.payload = payload or {}


class MPGClient:
    """
    Thin, well-tested wrapper around the MPG REST API.

    All credentials are read from Django settings (env-backed) so they are never
    hardcoded. The client validates configuration on first use and raises a
    clear error if something is missing.
    """

    DEFAULT_TIMEOUT = 15  # seconds
    DEFAULT_API_VERSION = "100"

    def __init__(self) -> None:
        self.gateway_url: str = (getattr(settings, "MPG_GATEWAY_URL", "") or "").rstrip("/")
        self.merchant_id: str = getattr(settings, "MPG_MERCHANT_ID", "") or ""
        self.api_password: str = getattr(settings, "MPG_API_PASSWORD", "") or ""
        self.api_version: str = str(getattr(settings, "MPG_API_VERSION", self.DEFAULT_API_VERSION))
        self.webhook_secret: str = getattr(settings, "MPG_WEBHOOK_SECRET", "") or ""
        self.currency: str = getattr(settings, "MPG_CURRENCY", "USD")
        self.timeout: int = int(getattr(settings, "MPG_HTTP_TIMEOUT", self.DEFAULT_TIMEOUT))

    # ------------------------------------------------------------------ helpers

    def _require_credentials(self) -> None:
        missing = [
            name for name, value in (
                ("MPG_GATEWAY_URL", self.gateway_url),
                ("MPG_MERCHANT_ID", self.merchant_id),
                ("MPG_API_PASSWORD", self.api_password),
            ) if not value
        ]
        if missing:
            raise MPGConfigurationError(
                f"MPG is not configured. Missing settings: {', '.join(missing)}"
            )

    def _base_url(self) -> str:
        # e.g. https://na.gateway.mastercard.com/api/rest/version/100/merchant/9104535224
        return f"{self.gateway_url}/api/rest/version/{self.api_version}/merchant/{self.merchant_id}"

    def _auth(self) -> tuple[str, str]:
        return (f"merchant.{self.merchant_id}", self.api_password)

    def _request(self, method: str, path: str, json_body: Optional[dict] = None) -> Dict[str, Any]:
        self._require_credentials()
        url = f"{self._base_url()}{path}"
        try:
            response = requests.request(
                method=method,
                url=url,
                json=json_body,
                auth=self._auth(),
                timeout=self.timeout,
                headers={"Content-Type": "application/json", "Accept": "application/json"},
            )
        except requests.RequestException as exc:
            logger.exception("MPG network error calling %s %s", method, path)
            raise MPGAPIError(f"Network error contacting payment gateway: {exc}") from exc

        # Avoid logging full payloads (PCI-sensitive). Log status + result code only.
        try:
            data = response.json() if response.content else {}
        except ValueError:
            data = {"raw": response.text[:500]}

        result = data.get("result") if isinstance(data, dict) else None
        logger.info(
            "MPG %s %s -> http=%s result=%s",
            method, path, response.status_code, result,
        )

        if response.status_code >= 400 or result == "ERROR":
            error = data.get("error") if isinstance(data, dict) else None
            cause = (error or {}).get("cause") if isinstance(error, dict) else None
            explanation = (error or {}).get("explanation") if isinstance(error, dict) else None
            raise MPGAPIError(
                f"MPG returned error: {cause or 'UNKNOWN'} - {explanation or response.reason}",
                status_code=response.status_code,
                payload=data if isinstance(data, dict) else None,
            )

        return data if isinstance(data, dict) else {}

    # ---------------------------------------------------------- public API ops

    def create_checkout_session(
        self,
        *,
        order_id: str,
        amount: Decimal,
        return_url: str,
        description: str,
        currency: Optional[str] = None,
        cancel_url: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Create a Hosted Checkout session.

        Returns dict containing:
          - session.id
          - session.version
          - successIndicator   (must be stored server-side and later compared
                                against the resultIndicator returned in the
                                browser redirect)
        """
        body: Dict[str, Any] = {
            "apiOperation": "INITIATE_CHECKOUT",
            "interaction": {
                "operation": "PURCHASE",
                "merchant": {
                    "name": getattr(settings, "MPG_MERCHANT_NAME", "Get Tours Nepal")[:40],
                },
                "returnUrl": return_url,
                "displayControl": {
                    "billingAddress": "HIDE",
                },
            },
            "order": {
                "id": order_id,
                "amount": f"{Decimal(amount):.2f}",
                "currency": currency or self.currency,
                "description": description[:127],
            },
        }
        if cancel_url:
            body["interaction"]["cancelUrl"] = cancel_url

        return self._request("POST", "/session", body)

    def retrieve_order(self, order_id: str) -> Dict[str, Any]:
        """Server-to-server fetch of the authoritative order status."""
        return self._request("GET", f"/order/{order_id}")

    def refund(self, *, order_id: str, transaction_id: str, amount: Decimal,
               currency: Optional[str] = None) -> Dict[str, Any]:
        body = {
            "apiOperation": "REFUND",
            "transaction": {
                "amount": f"{Decimal(amount):.2f}",
                "currency": currency or self.currency,
            },
        }
        return self._request("PUT", f"/order/{order_id}/transaction/{transaction_id}", body)

    # ------------------------------------------------------------- webhook auth

    def verify_webhook_signature(self, raw_body: bytes, received_signature: str) -> bool:
        """
        MPG signs notification payloads with HMAC-SHA256 using the configured
        webhook secret. The signature is sent in the `X-Notification-Secret`
        header (as configured in the MPG merchant admin portal).

        Falls back to constant-time comparison of the shared secret if the
        merchant account is configured for plain shared-secret notification.
        """
        if not self.webhook_secret or not received_signature:
            return False

        expected = hmac.new(
            key=self.webhook_secret.encode("utf-8"),
            msg=raw_body,
            digestmod=hashlib.sha256,
        ).hexdigest()

        if hmac.compare_digest(expected, received_signature):
            return True

        # Some MPG deployments simply send the shared secret verbatim.
        return hmac.compare_digest(self.webhook_secret, received_signature)

    @staticmethod
    def order_outcome(order_payload: Dict[str, Any]) -> str:
        """
        Normalise the MPG RETRIEVE_ORDER payload into one of:
        SUCCESS / FAILED / CANCELLED / PENDING.
        """
        result = (order_payload.get("result") or "").upper()
        status = (order_payload.get("status") or "").upper()

        if result == "SUCCESS" and status in {"CAPTURED", "AUTHORIZED"}:
            return "SUCCESS"
        if status == "CANCELLED":
            return "CANCELLED"
        if result == "FAILURE" or status in {"DECLINED", "FAILED"}:
            return "FAILED"
        return "PENDING"
