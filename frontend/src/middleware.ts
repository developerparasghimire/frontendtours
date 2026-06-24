import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "./routing";

const intlMiddleware = createMiddleware(routing);

export default function middleware(req: NextRequest) {
  const res = intlMiddleware(req);

  // Security headers on every response
  res.headers.set("X-Frame-Options", "SAMEORIGIN");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");

  return res;
}

export const config = {
  // Run on all routes except:
  // - Next.js internals (_next/*)
  // - Admin panel (gettoursadmin/*)
  // - OAuth callbacks (auth/*)
  // - API routes (api/*)
  // - Static files (favicon, robots, sitemap, any file with extension)
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|api/|gettoursadmin|auth/|robots\\.txt|sitemap\\.xml|.*\\..*).*)",
  ],
};
