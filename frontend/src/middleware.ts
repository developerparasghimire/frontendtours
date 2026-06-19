import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Locale-to-GT-code mapping (must mirror googleTranslate.ts LANGUAGES array)
const LOCALES = ['en','ja','zh','hi','ru','fr','de','es','ar','ko','pt','it','tr','th','nl'];

const LOCALE_TO_CODE: Record<string, string> = {
  'en':'en','ja':'ja','zh':'zh-CN','hi':'hi','ru':'ru',
  'fr':'fr','de':'de','es':'es','ar':'ar','ko':'ko',
  'pt':'pt','it':'it','tr':'tr','th':'th','nl':'nl',
};

const CODE_TO_LOCALE: Record<string, string> = {
  'en':'en','ja':'ja','zh-CN':'zh','hi':'hi','ru':'ru',
  'fr':'fr','de':'de','es':'es','ar':'ar','ko':'ko',
  'pt':'pt','it':'it','tr':'tr','th':'th','nl':'nl',
};

function getPathLocale(pathname: string): string | null {
  const seg = pathname.split("/")[1]?.toLowerCase();
  return seg && LOCALES.includes(seg) ? seg : null;
}

function stripLocale(pathname: string): string {
  const locale = getPathLocale(pathname);
  if (!locale) return pathname;
  const stripped = pathname.slice(`/${locale}`.length);
  return stripped || "/";
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const locale = getPathLocale(pathname);

  if (locale) {
    // /de/tours → serve /tours internally; browser keeps /de/tours in URL
    const url = req.nextUrl.clone();
    url.pathname = stripLocale(pathname);
    const res = NextResponse.rewrite(url);

    if (locale === "en") {
      res.cookies.delete("gt_lang");
      res.cookies.delete("googtrans");
    } else {
      const gtCode = LOCALE_TO_CODE[locale] ?? locale;
      res.cookies.set("gt_lang", gtCode, { path: "/", maxAge: 31536000, sameSite: "lax" });
      res.cookies.set("googtrans", `/en/${gtCode}`, { path: "/", sameSite: "lax" });
    }
    return res;
  }

  // No locale in URL — redirect if user has a non-English language saved
  const gtLang = req.cookies.get("gt_lang")?.value;
  if (gtLang && gtLang !== "en") {
    const localePrefix = CODE_TO_LOCALE[gtLang] ?? gtLang.split("-")[0];
    if (localePrefix && LOCALES.includes(localePrefix) && localePrefix !== "en") {
      const url = req.nextUrl.clone();
      url.pathname = `/${localePrefix}${pathname === "/" ? "" : pathname}`;
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Run on all paths except Next.js internals, API routes, and static files
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|api/|.*\\..*).*)" ],
};
