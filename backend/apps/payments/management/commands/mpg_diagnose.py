"""
Diagnostic command to test the MPG (Mastercard Payment Gateway) configuration
without needing to create a real booking.

Usage:
    python manage.py mpg_diagnose                         # smoke test (1 USD)
    python manage.py mpg_diagnose --amount 1 --currency USD
    python manage.py mpg_diagnose --amount 135 --currency NPR
    python manage.py mpg_diagnose --order GTN-DIAG-123    # inspect existing order

Prints:
  - Configured gateway URL, merchant ID, currency
  - Whether INITIATE_CHECKOUT succeeds for the given amount/currency
  - The hosted checkout URL you can open in a browser to test end-to-end
  - The raw MPG error (cause / explanation / gatewayCode) on failure
"""

from __future__ import annotations

import json
import secrets
from decimal import Decimal

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from apps.payments.mpg_client import (
    MPGAPIError,
    MPGClient,
    MPGConfigurationError,
)


class Command(BaseCommand):
    help = "Diagnose MPG (Mastercard Payment Gateway) configuration end-to-end."

    def add_arguments(self, parser):
        parser.add_argument("--amount", default="1.00",
                            help="Amount to test with (default: 1.00).")
        parser.add_argument("--currency", default=None,
                            help="Currency code (default: settings.MPG_CURRENCY).")
        parser.add_argument("--order", default=None,
                            help="If given, RETRIEVE_ORDER this order ID instead of creating a session.")

    def handle(self, *args, **opts):
        client = MPGClient()

        self.stdout.write(self.style.MIGRATE_HEADING("\n── MPG Configuration ──"))
        self.stdout.write(f"  Gateway URL : {client.gateway_url or '(missing)'}")
        self.stdout.write(f"  Merchant ID : {client.merchant_id or '(missing)'}")
        self.stdout.write(f"  API version : {client.api_version}")
        self.stdout.write(f"  Currency    : {client.currency}")
        self.stdout.write(
            f"  API password: {'set ('+str(len(client.api_password))+' chars)' if client.api_password else '(missing!)'}"
        )
        self.stdout.write(
            f"  Webhook key : {'set' if client.webhook_secret else '(not set)'}"
        )
        self.stdout.write(f"  BACKEND_PUBLIC_URL: {getattr(settings, 'BACKEND_PUBLIC_URL', '(missing!)')}")
        self.stdout.write(f"  FRONTEND_URL      : {getattr(settings, 'FRONTEND_URL', '(missing!)')}")

        try:
            client._require_credentials()
        except MPGConfigurationError as exc:
            raise CommandError(str(exc))

        # Inspect mode -----------------------------------------------------------
        if opts["order"]:
            self.stdout.write(self.style.MIGRATE_HEADING(f"\n── RETRIEVE_ORDER: {opts['order']} ──"))
            try:
                order = client.retrieve_order(opts["order"])
            except MPGAPIError as exc:
                self._print_error(exc)
                raise CommandError("RETRIEVE_ORDER failed.")
            self.stdout.write(json.dumps(order, indent=2, default=str))
            outcome = client.order_outcome(order)
            self.stdout.write(self.style.SUCCESS(f"\n  Normalised outcome: {outcome}"))
            return

        # Create-session mode ----------------------------------------------------
        amount = Decimal(opts["amount"])
        currency = (opts["currency"] or client.currency).upper()

        order_id = f"DIAG-{secrets.token_hex(6)}"
        backend = (getattr(settings, "BACKEND_PUBLIC_URL", "") or "https://example.com").rstrip("/")
        return_url = f"{backend}/api/v1/payments/mpg/return/?order={order_id}"

        self.stdout.write(self.style.MIGRATE_HEADING("\n── INITIATE_CHECKOUT ──"))
        self.stdout.write(f"  Order ID : {order_id}")
        self.stdout.write(f"  Amount   : {amount} {currency}")
        self.stdout.write(f"  Return URL: {return_url}")

        try:
            response = client.create_checkout_session(
                order_id=order_id,
                amount=amount,
                currency=currency,
                return_url=return_url,
                description=f"MPG diagnostic test {order_id}",
            )
        except MPGAPIError as exc:
            self.stdout.write(self.style.ERROR("\n  ✗ INITIATE_CHECKOUT failed."))
            self._print_error(exc)
            self.stdout.write(self.style.WARNING(
                "\nLikely causes:\n"
                "  • Currency not enabled on your merchant account by the acquirer.\n"
                "    (e.g. Nepali acquirers often only enable NPR — request USD activation.)\n"
                "  • Wrong MPG_GATEWAY_URL region (must match the merchant's region).\n"
                "  • Wrong MPG_API_PASSWORD.\n"
                "  • Amount below acquirer-allowed minimum.\n"
            ))
            raise CommandError("INITIATE_CHECKOUT failed.")

        session = response.get("session") or {}
        session_id = session.get("id")
        self.stdout.write(self.style.SUCCESS("\n  ✓ Session created."))
        self.stdout.write(f"    session.id        : {session_id}")
        self.stdout.write(f"    session.version   : {session.get('version')}")
        self.stdout.write(f"    successIndicator  : {response.get('successIndicator')}")

        pay_url = (
            f"{client.gateway_url}/checkout/pay/{session_id}"
            f"?checkoutVersion={session.get('version', '1.0.0')}"
        )
        self.stdout.write(self.style.SUCCESS("\n── Open this URL in your browser to test the card form ──"))
        self.stdout.write(f"  {pay_url}\n")
        self.stdout.write(self.style.WARNING(
            "If the hosted page still says 'Payment Unsuccessful' after entering a real card,\n"
            "run:  python manage.py mpg_diagnose --order " + order_id + "\n"
            "to see the precise gateway/acquirer reason."
        ))

    # ----------------------------------------------------------------- helpers
    def _print_error(self, exc: MPGAPIError) -> None:
        self.stdout.write(self.style.ERROR(f"  Message    : {exc}"))
        self.stdout.write(self.style.ERROR(f"  HTTP status: {exc.status_code}"))
        payload = exc.payload or {}
        error = payload.get("error") or {}
        if error:
            self.stdout.write(self.style.ERROR(
                f"  cause      : {error.get('cause')}"
            ))
            self.stdout.write(self.style.ERROR(
                f"  explanation: {error.get('explanation')}"
            ))
            self.stdout.write(self.style.ERROR(
                f"  field      : {error.get('field')}"
            ))
        gw = (payload.get("response") or {}).get("gatewayCode")
        if gw:
            self.stdout.write(self.style.ERROR(f"  gatewayCode: {gw}"))
        if payload:
            self.stdout.write("  Raw payload:")
            self.stdout.write(json.dumps(payload, indent=2, default=str))
