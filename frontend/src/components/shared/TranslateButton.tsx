"use client";

import { useState, useEffect, useCallback } from "react";
import {
  LANGUAGES, GT_DEFAULT, GT_LANG_KEY,
  getStoredLang, storeLang, setGTCookie,
} from "@/lib/googleTranslate";

type GTWindow = typeof window & { doGTranslate?: (pair: string) => void };

function triggerTranslation(code: string) {
  const pair = code === GT_DEFAULT ? "en|en" : `en|${code}`;

  // Method 1: doGTranslate (instant — available once GT has booted)
  const doGT = (window as GTWindow).doGTranslate;
  if (typeof doGT === "function") {
    doGT(pair);
    return;
  }

  // Method 2: manipulate the hidden combo select
  const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
  if (combo && combo.options.length > 1) {
    combo.value = code === GT_DEFAULT ? "" : code;
    combo.dispatchEvent(new Event("change", { bubbles: true }));
    return;
  }

  // Method 3: GT not ready yet — cookie is already set, reload will auto-translate
  window.location.reload();
}

export default function TranslateButton({ isOverlayNav }: { isOverlayNav: boolean }) {
  const [open, setOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(GT_DEFAULT);

  useEffect(() => {
    setCurrentLang(getStoredLang());
  }, []);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      const el = document.getElementById("translate-btn-root");
      if (el && !el.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleSelect = useCallback((code: string) => {
    setOpen(false);
    if (code === currentLang) return;
    setCurrentLang(code);
    storeLang(code);
    setGTCookie(code);
    localStorage.setItem(GT_LANG_KEY, code);
    triggerTranslation(code);
  }, [currentLang]);

  const current = LANGUAGES.find((l) => l.code === currentLang) ?? LANGUAGES[0];
  const displayCode =
    currentLang === "en" ? "EN"
    : currentLang === "zh-CN" ? "ZH"
    : currentLang.toUpperCase();

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
