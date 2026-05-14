# Deploying Get Tours Nepal to gettoursnepal.com

This guide assumes:
- Backend (Django) → Heroku app `gettours-backend` mapped to `api.gettoursnepal.com`
- Frontend (Next.js) → Vercel project `frontend` mapped to `gettoursnepal.com` (+ `www.gettoursnepal.com`)
- Domain `gettoursnepal.com` registered and DNS managed by you

---

## 0. Push latest code to GitHub

Replace `YOUR_PAT` with your GitHub Personal Access Token (`repo` scope):

```bash
# Backend
cd /home/paras/Documents/gettours/backend
git -c http.https://github.com/.extraheader="AUTHORIZATION: basic $(printf 'x-access-token:YOUR_PAT' | base64 -w0)" push -u origin main

# Frontend
cd /home/paras/Documents/gettours/frontend
git -c http.https://github.com/.extraheader="AUTHORIZATION: basic $(printf 'x-access-token:YOUR_PAT' | base64 -w0)" push -u origin main
```

---

## 1. DNS records (at your domain registrar)

| Host | Type | Value |
|---|---|---|
| `@` (gettoursnepal.com) | A / ALIAS | Vercel's IP `76.76.21.21` (or the value Vercel shows) |
| `www` | CNAME | `cname.vercel-dns.com` |
| `api` | CNAME | `<heroku-dns-target>` (see below) |

Get the Heroku DNS target with:
```bash
heroku domains:add api.gettoursnepal.com -a gettours-backend
```
Heroku will print a `*.herokudns.com` value — use it as the CNAME target.

---

## 2. Heroku — backend setup

### 2a. Install Heroku CLI & login
```bash
curl https://cli-assets.heroku.com/install.sh | sh
heroku login
```

### 2b. Create app & add PostgreSQL
```bash
# Create the app (skip if already exists)
heroku create gettours-backend

# Or link to existing app
heroku git:remote -a gettours-backend

# Add free Postgres (sets DATABASE_URL automatically)
heroku addons:create heroku-postgresql:essential-0 -a gettours-backend
```

### 2c. Set env vars

Run once, locally:

```bash
heroku config:set -a gettours-backend \
  SECRET_KEY="$(python -c 'import secrets;print(secrets.token_urlsafe(50))')" \
  DEBUG=False \
  ALLOWED_HOSTS=api.gettoursnepal.com,gettours-backend-b727a3afc844.herokuapp.com \
  CORS_ALLOWED_ORIGINS=https://gettoursnepal.com,https://www.gettoursnepal.com \
  CSRF_TRUSTED_ORIGINS=https://gettoursnepal.com,https://www.gettoursnepal.com,https://api.gettoursnepal.com \
  FRONTEND_URL=https://gettoursnepal.com \
  BACKEND_PUBLIC_URL=https://api.gettoursnepal.com \
  USE_X_FORWARDED_HOST=True \
  SECURE_SSL_REDIRECT=True \
  SESSION_COOKIE_SECURE=True \
  CSRF_COOKIE_SECURE=True \
  SECURE_HSTS_SECONDS=31536000 \
  EMAIL_HOST=smtp.gmail.com \
  EMAIL_PORT=587 \
  EMAIL_USE_TLS=True \
  EMAIL_HOST_USER=your-email@gmail.com \
  EMAIL_HOST_PASSWORD=your-gmail-app-password \
  DEFAULT_FROM_EMAIL='Get Tours Nepal <noreply@gettoursnepal.com>' \
  BOOKING_NOTIFY_EMAILS=admin@gettoursnepal.com \
  MPG_GATEWAY_URL=https://ap-gateway.mastercard.com \
  MPG_MERCHANT_ID=<your-merchant-id> \
  MPG_API_PASSWORD=<from-mpg-merchant-administration-portal> \
  MPG_WEBHOOK_SECRET=<from-mpg-merchant-administration-portal> \
  MPG_API_VERSION=100 \
  MPG_CURRENCY=USD \
  MPG_MERCHANT_NAME='Get Tours Nepal' \
  CLOUDINARY_CLOUD_NAME=your-cloud \
  CLOUDINARY_API_KEY=your-key \
  CLOUDINARY_API_SECRET=your-secret \
  GOOGLE_OAUTH_CLIENT_IDS=73837767846-dcvio61iisjfcod3ph94sepkoi8rhv6u.apps.googleusercontent.com \
  GOOGLE_OAUTH_CLIENT_SECRET=your-google-secret
```

Then deploy:
```bash
# Option A — connect GitHub repo in Heroku dashboard (recommended for auto-deploy):
# Dashboard → Deploy → GitHub → iamparasghimire/backend → Enable Automatic Deploys

# Option B — push directly via Heroku git:
git push heroku main
```

The `release` command in `Procfile` runs `collectstatic` and `migrate` automatically on every deploy.

### 2d. Create a superuser
```bash
heroku run python manage.py createsuperuser -a gettours-backend
```

---

## 3. Vercel — frontend setup

### 3a. Import the repo
1. Go to https://vercel.com/new
2. Click **Import Git Repository** → select `iamparasghimire/frontendtours`
3. Framework: **Next.js** (auto-detected), root directory: leave blank
4. Click **Deploy**

### 3b. Set env vars

In Vercel dashboard → Project → **Settings → Environment Variables** (set scope to **Production**):

| Key | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://api.gettoursnepal.com/api/v1` |
| `NEXT_PUBLIC_SITE_URL` | `https://gettoursnepal.com` |
| `BACKEND_URL` | `https://api.gettoursnepal.com` |
| `NEXT_PUBLIC_BASE_URL` | `https://gettoursnepal.com` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | `73837767846-dcvio61iisjfcod3ph94sepkoi8rhv6u.apps.googleusercontent.com` |
| `MPGS_MERCHANT_ID` | _(only if frontend needs it; usually backend-only)_ |
| `MPGS_API_PASSWORD` | _(NEVER set on the frontend — backend only)_ |
| `MPGS_BASE_URL` | _(backend only — keep MPG credentials server-side)_ |

Trigger a **Redeploy** after adding env vars.

### 3c. Add custom domains
In Vercel → Project → **Settings → Domains**:
- Add `gettoursnepal.com` (primary)
- Add `www.gettoursnepal.com` (redirect to primary)

---

## 4. MPG portal config

In your MPG merchant portal, allow this return URL pattern:
```
https://api.gettoursnepal.com/api/v1/payments/mpg/return/
```

---

## 5. Smoke tests after deploy

1. `curl -I https://api.gettoursnepal.com/api/v1/tours/` → expect `200`
2. Visit `https://gettoursnepal.com` → tours load
3. Make a guest booking with notes → complete payment with a real card
4. Verify:
   - Customer receives confirmation email
   - Admin (`BOOKING_NOTIFY_EMAILS`) receives notification with full details
   - Booking appears in Django admin at `https://api.gettoursnepal.com/admin/` with `special_requests` populated

---

## 6. What's in the code (production-ready)

- ✅ Single payment gateway: MPG (Stripe/NepalBank dead code removed)
- ✅ Guest + authenticated bookings store `special_requests` end-to-end
- ✅ Admin email notifications on every paid booking
- ✅ Django admin shows booking_reference, customer name/email/phone, special_requests
- ✅ All env-driven config — no hard-coded URLs or secrets
- ✅ HTTPS / HSTS / secure cookies enforced when `DEBUG=False`
