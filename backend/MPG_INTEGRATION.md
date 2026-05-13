# MPG (Mastercard Payment Gateway / Fingent) Integration

This document describes the MPG **Hosted Checkout** integration for Get Tours
Nepal — how it is wired, how to configure it, and how to test it.

> Reference: <https://mpgs.fingent.wiki/> — Fingent's wrapper docs over the
> Mastercard Payment Gateway Services REST API. The integration here speaks
> directly to the underlying MPGS REST API.

---

## 1. Architecture

```
Browser ─────────────────► Frontend (Next.js)
                              │
                              │  POST /api/v1/bookings/tours/create/
                              ▼
                          Backend (Django)
                              │  1. create booking
                              │  2. initiate_payment(gateway="MPG", ...)
                              ▼
                       PaymentTransaction (PENDING)
                              │
                              │  POST /session  (INITIATE_CHECKOUT)
                              ▼
                          MPG REST API ──► returns { sessionId, successIndicator }
                              │
                              ▼
              PaymentTransaction (INITIATED, stores successIndicator)
                              │
        303 redirect to {GATEWAY}/checkout/pay/{sessionId}
                              │
Browser pays card on Mastercard-hosted page
                              │
                              │ ◄── MPG webhook (signed)
                              │     POST /api/v1/payments/mpg/webhook/
                              ▼
                           Browser is redirected to:
                           /api/v1/payments/mpg/return/?order=…&resultIndicator=…
                              │
                              │  1. compare resultIndicator vs stored successIndicator
                              │  2. RETRIEVE_ORDER (server-to-server, authoritative)
                              │  3. update PaymentTransaction + Booking atomically
                              ▼
                           302 ► /payment/success | /payment/failed | /payment/cancelled
```

Both the browser-return path **and** the webhook independently verify the
order via `RETRIEVE_ORDER`. Whichever lands first finalises the transaction;
the other is a no-op (idempotent via `select_for_update` + status guard).

## 2. Files

| Path | Purpose |
|------|---------|
| `apps/payments/mpg_client.py`   | Thin REST client + webhook signature verifier |
| `apps/payments/services.py`     | `create_mpg_checkout_session`, gateway dispatcher |
| `apps/payments/views.py`        | Initiate / Return / Webhook / Status endpoints |
| `apps/payments/urls.py`         | URL wiring under `/api/v1/payments/` |
| `apps/payments/models.py`       | `PaymentTransaction` with MPG-specific columns |
| `apps/payments/tests.py`        | 12 tests covering the full flow |
| `frontend/src/app/payment/...`  | success / cancelled / failed result pages |
| `frontend/src/lib/api.ts`       | `getPaymentStatus`, `initiateMPGPayment` |

## 3. Endpoints

| Method | URL | Auth | Purpose |
|--------|-----|------|---------|
| POST | `/api/v1/bookings/tours/create/`   | JWT (user) | Creates a booking and initiates MPG checkout (default) |
| POST | `/api/v1/bookings/events/create/`  | JWT (user) | Same for events |
| POST | `/api/v1/payments/mpg/initiate/`   | JWT (user) | Initiate (or re-initiate) MPG for an existing booking |
| GET  | `/api/v1/payments/mpg/return/`     | public | Browser redirect back from MPG |
| POST | `/api/v1/payments/mpg/webhook/`    | HMAC | Server-to-server payment notification |
| GET  | `/api/v1/payments/<order>/status/` | JWT (owner) | Polled by the success page until SUCCESS lands |

## 4. Environment variables

Add these to `backend/.env` (see `.env.example`):

```ini
# Public URL of THIS backend (must be HTTPS in production — MPG return URL).
BACKEND_PUBLIC_URL=https://api.your-domain.com

# Frontend (used to redirect the browser back to user-facing pages).
FRONTEND_URL=https://www.your-domain.com

# MPG / Fingent
MPG_GATEWAY_URL=https://na.gateway.mastercard.com
MPG_MERCHANT_ID=9104535224
MPG_API_PASSWORD=<from Merchant Administration portal>
MPG_WEBHOOK_SECRET=<from Merchant Administration portal>
MPG_API_VERSION=100
MPG_CURRENCY=USD
MPG_MERCHANT_NAME=Get Tours Nepal
MPG_HTTP_TIMEOUT=15
PAYMENTS_LOG_LEVEL=INFO
```

`MPG_GATEWAY_URL` is the regional endpoint your acquirer assigned to you.
Common values:

| Region | URL |
|--------|-----|
| North America | `https://na.gateway.mastercard.com` |
| Asia Pacific  | `https://ap.gateway.mastercard.com` |
| Europe        | `https://eu.gateway.mastercard.com` |
| MTF (test)    | `https://test-gateway.mastercard.com` |

The merchant ID `9104535224` is committed in `.env.example`; the API password
and webhook secret **must never be committed**.

## 5. Webhook configuration in the MPG portal

1. Sign in to **Merchant Administration**.
2. Go to *Admin → Notifications* (or *Webhooks*).
3. Set the notification URL to:
   `https://api.your-domain.com/api/v1/payments/mpg/webhook/`
4. Generate a webhook secret and copy it into `MPG_WEBHOOK_SECRET`.
5. Save and send a test notification.

The view verifies the secret using HMAC-SHA256 against the raw request body
(header `X-Notification-Secret`). Falls back to plain shared-secret comparison
if your account is configured for that mode.

## 6. Local testing

```bash
cd backend
source .venv/bin/activate
python manage.py migrate
python manage.py test apps.payments
```

All 12 tests should pass without any real credentials — the network layer is
mocked.

## 7. Manual end-to-end test

1. Start the backend (`python manage.py runserver`) and frontend
   (`npm run dev`).
2. Sign in, open a tour, click *Book Now*, fill the form, click *Confirm & Pay*.
3. The browser is redirected to `https://test-gateway.mastercard.com/checkout/pay/...`.
4. Use a [test card](https://test-gateway.mastercard.com/api/documentation/integrationGuidelines/supportedFeatures/testAndGoLive.html?locale=en_US):
   - `5123 4500 0000 0008`, any future expiry, any CVV → **SUCCESS**
   - `5111 1111 1111 1118` → **DECLINED** → redirected to `/payment/failed`
   - Cancel on the hosted page → redirected to `/payment/cancelled`
5. Verify in Django admin → Payments that the `PaymentTransaction` is
   `SUCCESS` and the related booking is `CONFIRMED`.

## 8. Test scenarios covered

| Scenario | Where |
|---|---|
| Successful payment, booking confirmed | `MPGReturnViewTests.test_successful_return_marks_paid_and_confirms_booking` |
| Failed payment | `MPGReturnViewTests.test_amount_mismatch_marks_failed` |
| Cancelled transaction | `MPGReturnViewTests.test_cancel_redirects_and_marks_cancelled` |
| Network/unknown order | `MPGReturnViewTests.test_unknown_order_redirects_to_failure` |
| Bad webhook signature rejected | `MPGWebhookTests.test_webhook_rejects_bad_signature` |
| Webhook idempotency (no double-process) | `MPGWebhookTests.test_webhook_is_idempotent` |
| Authorisation: other users blocked | `MPGInitiateAPITests.test_initiate_rejects_other_users_booking`, `PaymentStatusAPITests.test_other_user_cannot_read_status` |
| Input validation | `MPGInitiateAPITests.test_initiate_validates_payload` |

## 9. Security checklist

- ☑ **HTTPS-only in production** — `SECURE_SSL_REDIRECT` is enabled by
  default when `DEBUG=False`. The `BACKEND_PUBLIC_URL` you give MPG **must**
  be `https://...`.
- ☑ **Server-side amount + currency verification** — `RETRIEVE_ORDER` is
  always called; mismatches mark the transaction `FAILED` and log an error.
- ☑ **resultIndicator anti-tamper check** — compared via `hmac.compare_digest`.
- ☑ **Webhook HMAC signature** — verified before any DB work.
- ☑ **Idempotent webhook + return** — `select_for_update` + early-return on
  finalised statuses.
- ☑ **No client trust** — booking ownership is re-checked server-side; the
  `successIndicator` is never sent to the browser.
- ☑ **No sensitive data in logs** — only HTTP status + MPG `result` field.
- ☑ **Credentials are env-only** — no defaults are shipped.
- ☑ **CSRF exempt only on the webhook** (which is HMAC-authenticated).

## 10. Deployment steps

1. `pip install -r requirements.txt` (adds `requests>=2.31`).
2. `python manage.py migrate` (applies migration 0003).
3. Set the env vars from §4 in your production environment
   (Heroku config vars / Render env / etc.).
4. Configure the webhook URL in the MPG merchant portal (§5).
5. Smoke-test with the test card from §7.
6. Switch `MPG_GATEWAY_URL` from the MTF host to your production regional
   host when going live.
