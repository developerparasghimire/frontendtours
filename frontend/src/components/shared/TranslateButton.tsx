"use client";

import { useState, useRef, useEffect } from "react";

const LANGUAGES = [
  { code: "en",    label: "English",    flag: "🇬🇧" },
  { code: "fr",    label: "Français",   flag: "🇫🇷" },
  { code: "de",    label: "Deutsch",    flag: "🇩🇪" },
  { code: "es",    label: "Español",    flag: "🇪🇸" },
  { code: "zh-CN", label: "中文",        flag: "🇨🇳" },
  { code: "ja",    label: "日本語",      flag: "🇯🇵" },
  { code: "ar",    label: "العربية",    flag: "🇸🇦" },
  { code: "ru",    label: "Русский",    flag: "🇷🇺" },
  { code: "ko",    label: "한국어",     flag: "🇰🇷" },
  { code: "hi",    label: "हिन्दी",     flag: "🇮🇳" },
  { code: "pt",    label: "Português",  flag: "🇧🇷" },
  { code: "it",    label: "Italiano",   flag: "🇮🇹" },
  { code: "nl",    label: "Nederlands", flag: "🇳🇱" },
  { code: "tr",    label: "Türkçe",     flag: "🇹🇷" },
  { code: "th",    label: "ไทย",        flag: "🇹🇭" },
];

function triggerGoogleTranslate(langCode: string) {
  // Try the goog-te-combo select created by the widget
  const select = document.querySelector<HTMLSelectElement>(".goog-te-combo");
  if (select) {
    select.value = langCode;
    select.dispatchEvent(new Event("change", { bubbles: true }));
    return;
  }
  // Fallback: redirect via translate.google.com
  if (langCode === "en") {
    // Restore original: reload without translate
    const frame = document.getElementById("goog-te-banner-frame") as HTMLIFrameElement | null;
    const restoreLink = frame?.contentDocument?.querySelector<HTMLAnchorElement>("[id=:1]");
    if (restoreLink) { restoreLink.click(); return; }
  }
}

export default function TranslateButton({ isOverlayNav }: { isOverlayNav: boolean }) {
  const [open, setOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("en");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = LANGUAGES.find((l) => l.code === currentLang) ?? LANGUAGES[0];

  function select(lang: (typeof LANGUAGES)[number]) {
    setCurrentLang(lang.code);
    setOpen(false);
    if (lang.code === "en") {
      // Restore to original English
      const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
      if (combo) {
        combo.value = "";
        combo.dispatchEvent(new Event("change", { bubbles: true }));
      }
      // Also try the "Show original" cookie approach
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=." + window.location.hostname;
      window.location.reload();
      return;
    }
    triggerGoogleTranslate(lang.code);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
          isOverlayNav
            ? "text-white/80 hover:bg-white/10"
            : "text-brand-navy hover:bg-brand-navy/5 border border-gray-200"
        }`}
        aria-label="Select language"
      >
        <span className="text-sm">{current.flag}</span>
        <span>{current.code === "en" ? "EN" : current.code.toUpperCase().replace("-CN", "")}</span>
        <svg
          className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 max-h-80 overflow-y-auto">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => select(l)}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                currentLang === l.code
                  ? "bg-brand-navy/5 text-brand-navy font-bold"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="text-base">{l.flag}</span>
              <span>{l.label}</span>
              {currentLang === l.code && (
                <svg className="w-3.5 h-3.5 text-brand-navy ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
