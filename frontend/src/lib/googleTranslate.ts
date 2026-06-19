// Central utility for Google Translate widget control.
// All components import from here — never duplicate this logic.

export const GT_LANG_KEY = "gt_lang_v3";
export const GT_DEFAULT = "en";

export const LANGUAGES = [
  { code: "en",    label: "English",    flag: "🇬🇧" },
  { code: "ja",    label: "日本語",      flag: "🇯🇵" },
  { code: "zh-CN", label: "中文",        flag: "🇨🇳" },
  { code: "hi",    label: "हिन्दी",     flag: "🇮🇳" },
  { code: "ru",    label: "Русский",    flag: "🇷🇺" },
  { code: "fr",    label: "Français",   flag: "🇫🇷" },
  { code: "de",    label: "Deutsch",    flag: "🇩🇪" },
  { code: "es",    label: "Español",    flag: "🇪🇸" },
  { code: "ar",    label: "العربية",    flag: "🇸🇦" },
  { code: "ko",    label: "한국어",     flag: "🇰🇷" },
  { code: "pt",    label: "Português",  flag: "🇧🇷" },
  { code: "it",    label: "Italiano",   flag: "🇮🇹" },
  { code: "tr",    label: "Türkçe",     flag: "🇹🇷" },
  { code: "th",    label: "ไทย",        flag: "🇹🇭" },
  { code: "nl",    label: "Nederlands", flag: "🇳🇱" },
] as const;

export type LangEntry = (typeof LANGUAGES)[number];

// ─── Storage ────────────────────────────────────────────────────────────────

export function getStoredLang(): string {
  if (typeof window === "undefined") return GT_DEFAULT;
  try { return localStorage.getItem(GT_LANG_KEY) ?? GT_DEFAULT; } catch { return GT_DEFAULT; }
}

export function storeLang(lang: string): void {
  try { localStorage.setItem(GT_LANG_KEY, lang); } catch {}
}

// ─── Cookie ─────────────────────────────────────────────────────────────────
// googtrans=/en/<code> tells the widget which language to apply on load.

export function setGTCookie(lang: string): void {
  if (typeof document === "undefined") return;
  const h = window.location.hostname;
  const gone = "expires=Thu, 01 Jan 1970 00:00:00 UTC";

  // Wipe all variants first
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

// ─── Widget control ──────────────────────────────────────────────────────────

function getCombo(): HTMLSelectElement | null {
  return document.querySelector<HTMLSelectElement>(".goog-te-combo");
}

// Apply translation right now — caller must ensure widget is ready.
export function applyTranslation(lang: string): void {
  const combo = getCombo();
  if (!combo) return;
  combo.value = lang === GT_DEFAULT ? "" : lang;
  combo.dispatchEvent(new Event("change", { bubbles: true }));
}

// Wait up to `maxMs` for the widget's combo to appear, then run callback.
// Returns a cancel function.
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

// Convenience: wait for combo then apply language.
export function translateWhenReady(lang: string, maxMs = 6000): () => void {
  return whenReady(() => applyTranslation(lang), maxMs);
}
