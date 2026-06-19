"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  LANGUAGES, GT_DEFAULT, GT_LANG_KEY,
  getStoredLang, storeLang, setGTCookie, translateWhenReady, applyTranslation,
} from "@/lib/googleTranslate";

export default function TranslateButton({ isOverlayNav }: { isOverlayNav: boolean }) {
  const [open, setOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(GT_DEFAULT);
  const ref = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<(() => void) | null>(null);

  // Sync button label to stored lang on mount
  useEffect(() => {
    setCurrentLang(getStoredLang());
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleSelect = useCallback((code: string) => {
    setOpen(false);
    if (code === currentLang) return;

    setCurrentLang(code);
    storeLang(code);
    setGTCookie(code);          // persist across full reloads
    localStorage.setItem(GT_LANG_KEY, code); // redundant-but-safe

    if (cancelRef.current) cancelRef.current();

    if (code === GT_DEFAULT) {
      // Restore English — combo value "" triggers GT to show original
      applyTranslation(GT_DEFAULT);
    } else {
      // Try live widget first; if not ready (first visit) reload so cookie kicks in
      const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
      if (combo) {
        applyTranslation(code);
      } else {
        cancelRef.current = translateWhenReady(code, 3000);
        // If still not ready after 3s, the cookie will handle it on next full load
      }
    }
  }, [currentLang]);

  const current = LANGUAGES.find((l) => l.code === currentLang) ?? LANGUAGES[0];
  const displayCode =
    currentLang === "en" ? "EN"
    : currentLang === "zh-CN" ? "ZH"
    : currentLang.toUpperCase();

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
              key={l.code}
              onClick={() => handleSelect(l.code)}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                currentLang === l.code
                  ? "bg-brand-navy/5 text-brand-navy font-bold"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="text-base leading-none">{l.flag}</span>
              <span>{l.label}</span>
              {currentLang === l.code && (
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
