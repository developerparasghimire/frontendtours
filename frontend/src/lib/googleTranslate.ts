// Central utility for Google Translate + locale URL routing.
// Import from here only — no logic duplication across components.

export const GT_LANG_KEY  = "gt_lang_v3";   // localStorage key
export const GT_LANG_COOKIE = "gt_lang";     // cookie readable by middleware
export const GT_DEFAULT   = "en";

export const LANGUAGES = [
  { code: "en",    locale: "en", label: "English",   flag: "🇬🇧" },
  { code: "fr",    locale: "fr", label: "Français",  flag: "🇫🇷" },
  { code: "de",    locale: "de", label: "Deutsch",   flag: "🇩🇪" },
  { code: "es",    locale: "es", label: "Español",   flag: "🇪🇸" },
  { code: "it",    locale: "it", label: "Italiano",  flag: "🇮🇹" },
  { code: "zh-CN", locale: "zh", label: "中文",       flag: "🇨🇳" },
  { code: "ja",    locale: "ja", label: "日本語",     flag: "🇯🇵" },
  { code: "hi",    locale: "hi", label: "हिन्दी",    flag: "🇮🇳" },
  { code: "ru",    locale: "ru", label: "Русский",   flag: "🇷🇺" },
] as const;

export type LangEntry = (typeof LANGUAGES)[number];

// All URL locale segments (used in middleware + provider)
export const LOCALES = LANGUAGES.map((l) => l.locale);

// locale ("zh") → GT code ("zh-CN")
export const LOCALE_TO_CODE: Record<string, string> = Object.fromEntries(
  LANGUAGES.map((l) => [l.locale, l.code])
);

// GT code ("zh-CN") → locale ("zh")
export const CODE_TO_LOCALE: Record<string, string> = Object.fromEntries(
  LANGUAGES.map((l) => [l.code, l.locale])
);

// ─── Path helpers ────────────────────────────────────────────────────────────

// "/de/tours/abc" → "de"  |  "/tours/abc" → null
export function getPathLocale(pathname: string): string | null {
  const seg = pathname.split("/")[1]?.toLowerCase();
  return seg && (LOCALES as readonly string[]).includes(seg) ? seg : null;
}

// "/de/tours/abc" → "/tours/abc"  |  "/de" → "/"
export function stripLocale(pathname: string): string {
  const locale = getPathLocale(pathname);
  if (!locale) return pathname;
  const stripped = pathname.slice(`/${locale}`.length);
  return stripped || "/";
}

// Build the locale-prefixed path for a given GT code + current pathname
export function localePath(gtCode: string, pathname: string): string {
  const locale = CODE_TO_LOCALE[gtCode] ?? gtCode.split("-")[0];
  if (locale === "en") return stripLocale(pathname);
  const base = stripLocale(pathname);
  return base === "/" ? `/${locale}` : `/${locale}${base}`;
}

// ─── Storage ─────────────────────────────────────────────────────────────────

export function getStoredLang(): string {
  if (typeof window === "undefined") return GT_DEFAULT;
  try { return localStorage.getItem(GT_LANG_KEY) ?? GT_DEFAULT; } catch { return GT_DEFAULT; }
}

export function storeLang(lang: string): void {
  try { localStorage.setItem(GT_LANG_KEY, lang); } catch {}
  // Also write a plain cookie so Next.js middleware can read it server-side
  if (typeof document !== "undefined") {
    const maxAge = 60 * 60 * 24 * 365;
    const h = window.location.hostname;
    document.cookie = `${GT_LANG_COOKIE}=${lang}; path=/; max-age=${maxAge}; SameSite=Lax`;
    document.cookie = `${GT_LANG_COOKIE}=${lang}; path=/; max-age=${maxAge}; SameSite=Lax; domain=.${h}`;
  }
}

// ─── googtrans cookie ─────────────────────────────────────────────────────────

export function setGTCookie(lang: string): void {
  if (typeof document === "undefined") return;
  const h = window.location.hostname;
  const gone = "expires=Thu, 01 Jan 1970 00:00:00 UTC";
  for (const d of ["", `; domain=${h}`, `; domain=.${h}`]) {
    document.cookie = `googtrans=; ${gone}; path=/${d}`;
  }
  if (lang !== GT_DEFAULT) {
    const v = `/en/${lang}`;
    for (const d of ["", `; domain=${h}`, `; domain=.${h}`]) {
      document.cookie = `googtrans=${v}; path=/; SameSite=Lax${d}`;
    }
  }
}

// ─── Widget control ───────────────────────────────────────────────────────────

// Wait for the combo to exist AND have options loaded (GT populates them async)
function getCombo(): HTMLSelectElement | null {
  const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
  return combo && combo.options.length > 1 ? combo : null;
}

export function applyTranslation(lang: string): void {
  // Method 1: doGTranslate — GT's internal function used by its own toolbar links
  type GTWindow = typeof window & { doGTranslate?: (pair: string) => void };
  const doGT = (window as GTWindow).doGTranslate;
  if (typeof doGT === "function") {
    doGT(lang === GT_DEFAULT ? "en|en" : `en|${lang}`);
    return;
  }

  // Method 2: combo select manipulation
  const combo = getCombo();
  if (!combo) return;
  combo.value = lang === GT_DEFAULT ? "" : lang;
  combo.dispatchEvent(new Event("change", { bubbles: true }));
}

export function whenReady(cb: () => void, maxMs = 6000): () => void {
  let t: ReturnType<typeof setTimeout> | null = null;
  const start = Date.now();
  const tick = () => {
    if (getCombo()) { cb(); return; }
    if (Date.now() - start < maxMs) { t = setTimeout(tick, 150); }
  };
  tick();
  return () => { if (t) clearTimeout(t); };
}

export function translateWhenReady(lang: string, maxMs = 6000): () => void {
  return whenReady(() => applyTranslation(lang), maxMs);
}
