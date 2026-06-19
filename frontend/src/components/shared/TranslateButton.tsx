"use client";

import { useState, useRef, useEffect, useCallback } from "react";

const LANGUAGES = [
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
];

const LS_KEY = "gt_selected_lang";

function setGoogTransCookie(code: string) {
  const host = window.location.hostname;
  const exp = "expires=Thu, 01 Jan 1970 00:00:00 UTC";
  // Clear old cookie on all domain variants
  document.cookie = `googtrans=; ${exp}; path=/;`;
  document.cookie = `googtrans=; ${exp}; path=/; domain=${host};`;
  document.cookie = `googtrans=; ${exp}; path=/; domain=.${host};`;
  if (code !== "en") {
    const val = `/en/${code}`;
    document.cookie = `googtrans=${val}; path=/; SameSite=Lax`;
    document.cookie = `googtrans=${val}; path=/; domain=${host}; SameSite=Lax`;
  }
}

function triggerCombo(code: string): boolean {
  const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
  if (!combo) return false;
  combo.value = code === "en" ? "" : code;
  combo.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}

function waitAndTrigger(code: string, attempts = 0) {
  if (triggerCombo(code)) return;
  if (attempts < 20) {
    setTimeout(() => waitAndTrigger(code, attempts + 1), 200);
  }
}

export default function TranslateButton({ isOverlayNav }: { isOverlayNav: boolean }) {
  const [open, setOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("en");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) setCurrentLang(saved);
    } catch {}
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = useCallback((lang: (typeof LANGUAGES)[number]) => {
    setOpen(false);
    if (lang.code === currentLang) return;

    setCurrentLang(lang.code);
    try { localStorage.setItem(LS_KEY, lang.code); } catch {}

    // Set cookie so translation persists across page navigations
    setGoogTransCookie(lang.code);

    // Try to trigger the live Google Translate widget immediately
    // (works if the widget has already loaded on this page)
    if (!triggerCombo(lang.code)) {
      // Widget not ready yet — reload so the cookie is picked up on next load
      window.location.reload();
    }
  }, [currentLang]);

  // On mount, if a non-English lang is stored, trigger the widget once it loads
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved && saved !== "en") {
        waitAndTrigger(saved);
      }
    } catch {}
  }, []);

  const current = LANGUAGES.find((l) => l.code === currentLang) ?? LANGUAGES[0];
  const displayCode = currentLang === "en" ? "EN"
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
              onClick={() => handleSelect(l)}
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
