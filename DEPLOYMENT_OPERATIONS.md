# Get Tours Deployment Operations Checklist

This repo now includes the core code-side pieces for safer production deployments:

- Django HTTPS-aware security settings in [backend/config/settings.py](/home/paras/Documents/gettours/backend/config/settings.py)
- A health endpoint at `/api/v1/common/health/`
- Next.js security and cache headers in [frontend/next.config.ts](/home/paras/Documents/gettours/frontend/next.config.ts)
- WhiteNoise for Django static assets and Cloudinary for uploaded media

The remaining items below still need real hosting setup in your deployment platform.

## Required Production Setup

### 1. HTTPS / SSL
- Put both frontend and backend behind HTTPS.
- If you deploy behind Nginx, Vercel, Cloudflare, Render, Railway, or AWS ALB, forward `X-Forwarded-Proto=https`.
- Set the backend env vars from [backend/.env.example](/home/paras/Documents/gettours/backend/.env.example).

### 2. Uptime Monitoring
- Monitor `GET /api/v1/common/health/`.
- Alert if the endpoint returns anything other than `200`.
- Use this same endpoint as the load balancer health check target.

### 3. CDN / Static Files
- Frontend: serve through Vercel or Cloudflare CDN.
- Backend media: keep Cloudinary enabled in production.
- Backend static files: WhiteNoise is already configured, but a CDN in front of the backend is still recommended.

### 4. Caching
- Public frontend pages already use ISR/revalidation in the Next app.
- Keep CDN caching enabled for static assets and optimized images.
- If traffic grows, add Redis for API/data caching before scaling the database.

### 5. Load Balancer
- Single instance is fine for low traffic.
- For medium/high traffic, run multiple backend instances behind a load balancer and use the health endpoint above.
- Use shared media storage only. Do not rely on local disk uploads across multiple backend instances.

### 6. Database Backups
- Enable automated daily backups on your managed Postgres provider.
- Keep point-in-time recovery on if your provider offers it.
- Test restoring backups into a staging database at least once before launch.

### 7. Monitoring / Logs
- Capture application logs from Django and Next.js.
- Add database monitoring for CPU, memory, slow queries, and storage growth.
- Track frontend errors with a service like Sentry.

## Recommended Hosting Stack

- Frontend: Vercel
- Backend: Render, Railway, Fly.io, ECS, or a VPS behind Nginx
- Database: managed PostgreSQL
- Media: Cloudinary
- DNS / CDN / WAF: Cloudflare

## Launch Sanity Check

1. Frontend loads over `https://`.
2. Backend API loads over `https://`.
3. `GET /api/v1/common/health/` returns `200`.
4. Login, booking, admin status update, and review submission work in production.
5. Cloudinary uploads work.
6. Backups and uptime alerts are enabled.
