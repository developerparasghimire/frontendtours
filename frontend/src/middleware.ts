import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Prevent clickjacking
  res.headers.set("X-Frame-Options", "SAMEORIGIN");
  // Stop MIME-type sniffing
  res.headers.set("X-Content-Type-Options", "nosniff");
  // Referrer policy (privacy + security balance)
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  // Permissions policy — disable unused browser features
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()"
  );

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|api/|.*\\..*).*)" ],
};
