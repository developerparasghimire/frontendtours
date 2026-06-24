"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { LANGUAGES, stripLocale, getPathLocale } from "@/lib/googleTranslate";

// The cookie name must match what's in src/routing.ts
const LOCALE_COOKIE = "NEXT_LOCALE";

function setLocaleCookie(locale: string) {
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export default function TranslateButton({ isOverlayNav }: { isOverlayNav: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Derive active locale from URL (works SSR + CSR)
  const activeLocale = getPathLocale(pathname ?? "") ?? "en";
  const current = LANGUAGES.find((l) => l.locale === activeLocale) ?? LANGUAGES[0];

  useEffect(() => {
    const h = (e: MouseEvent) => {
      const el = document.getElementById("translate-btn-root");
      if (el && !el.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleSelect = useCallback((locale: string) => {
    setOpen(false);
    if (locale === activeLocale) return;

    // Set cookie so middleware persists the choice across all subsequent requests
    setLocaleCookie(locale);

    // Navigate to locale-prefixed URL (middleware sets cookie on arrival too)
    const base = stripLocale(pathname ?? "") || "/";
    const target = locale === "en" ? base : `/${locale}${base}`;
    window.location.href = target;
  }, [activeLocale, pathname]);

  const displayCode =
    activeLocale === "zh" ? "ZH"
    : activeLocale.toUpperCase();

  return (
    <div className="relative" id="translate-btn-root">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
          isOverlayNav
            ? "text-white/80 hover:bg-white/10"
            : "text-brand-navy hover:bg-brand-navy/5 border border-gray-200"
        }`}
        aria-label="Select language"
      >
        <span className="text-sm leading-none">{current.flag}</span>
        <span>{displayCode}</span>
        <svg
          className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[200] max-h-80 overflow-y-auto">
          {LANGUAGES.map((l) => (
            <button
              key={l.locale}
              onClick={() => handleSelect(l.locale)}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                activeLocale === l.locale
                  ? "bg-brand-navy/5 text-brand-navy font-bold"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="text-base leading-none">{l.flag}</span>
              <span>{l.label}</span>
              {activeLocale === l.locale && (
                <svg className="w-3.5 h-3.5 text-brand-navy ml-auto shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
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
