import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOCALES = ["en", "np", "fr", "de", "es", "zh", "ja"] as const;
type Locale = (typeof LOCALES)[number];

const DEFAULT_LOCALE: Locale = "en";

// Locale URL prefix → LangCode stored in cookie
const LOCALE_TO_LANG: Record<Locale, string> = {
  en: "EN", np: "NP", fr: "FR", de: "DE", es: "ES", zh: "ZH", ja: "JA",
};

function getLocaleFromCookie(req: NextRequest): Locale {
  const val = req.cookies.get("gt_lang")?.value?.toLowerCase() as Locale | undefined;
  return val && LOCALES.includes(val as Locale) ? (val as Locale) : DEFAULT_LOCALE;
}

function getLocaleFromAcceptLanguage(req: NextRequest): Locale {
  const header = req.headers.get("accept-language") || "";
  for (const segment of header.split(",")) {
    const lang = segment.split(";")[0].trim().split("-")[0].toLowerCase();
    // Map browser lang codes to our locales
    const map: Record<string, Locale> = {
      en: "en", ne: "np", fr: "fr", de: "de", es: "es", zh: "zh", ja: "ja",
    };
    if (map[lang]) return map[lang];
  }
  return DEFAULT_LOCALE;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Check if path starts with a locale prefix
  const firstSegment = pathname.split("/")[1]?.toLowerCase() as Locale | undefined;
  const hasLocale = firstSegment !== undefined && LOCALES.includes(firstSegment as Locale);

  if (hasLocale) {
    const locale = firstSegment as Locale;
    // Rewrite internally: strip locale prefix for Next.js router
    const internalPath = pathname.slice(`/${locale}`.length) || "/";
    const rewriteUrl = req.nextUrl.clone();
    rewriteUrl.pathname = internalPath;

    const response = NextResponse.rewrite(rewriteUrl);
    // Keep cookie in sync with URL locale
    response.cookies.set("gt_lang", LOCALE_TO_LANG[locale], {
      path: "/",
      maxAge: 31536000,
      sameSite: "lax",
    });
    return response;
  }

  // No locale prefix — detect preferred locale and redirect
  const locale =
    getLocaleFromCookie(req) ||
    getLocaleFromAcceptLanguage(req) ||
    DEFAULT_LOCALE;

  const redirectUrl = req.nextUrl.clone();
  redirectUrl.pathname = `/${locale}${pathname}`;

  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, robots.txt, sitemap.xml
     * - logo.png and other public assets
     * - /api/ routes (Django proxy or Next.js API)
     * - /gettoursadmin/ (admin panel, no locale prefix)
     * - /auth/ (OAuth callbacks)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|logo\\.png|robots\\.txt|sitemap\\.xml|api/|gettoursadmin/|auth/).*)",
  ],
};
