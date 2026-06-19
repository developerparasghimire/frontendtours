import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Locale routing removed — pages are served at their canonical paths.
// Browser auto-translate (Chrome) handles language switching.
export function middleware(req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
