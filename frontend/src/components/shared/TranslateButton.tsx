"use client";

import { useState, useRef, useEffect } from "react";

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

function readCurrentLang(): string {
  if (typeof document === "undefined") return "en";
  const m = document.cookie.match(/(?:^|;\s*)googtrans=\/en\/([^;]+)/);
  return m ? m[1] : "en";
}

function applyTranslation(code: string) {
  const exp = "Thu, 01 Jan 1970 00:00:00 UTC";
  const host = window.location.hostname;
  // Clear existing cookie on all variants
  document.cookie = `googtrans=; expires=${exp}; path=/;`;
  document.cookie = `googtrans=; expires=${exp}; path=/; domain=${host};`;
  document.cookie = `googtrans=; expires=${exp}; path=/; domain=.${host};`;

  if (code !== "en") {
    const val = `/en/${code}`;
    document.cookie = `googtrans=${val}; path=/;`;
    document.cookie = `googtrans=${val}; path=/; domain=${host};`;
  }
  window.location.reload();
}

export default function TranslateButton({ isOverlayNav }: { isOverlayNav: boolean }) {
  const [open, setOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("en");
  const ref = useRef<HTMLDivElement>(null);

  // Read active language from googtrans cookie on mount
  useEffect(() => {
    setCurrentLang(readCurrentLang());
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = LANGUAGES.find((l) => l.code === currentLang) ?? LANGUAGES[0];

  function handleSelect(lang: (typeof LANGUAGES)[number]) {
    setOpen(false);
    if (lang.code === currentLang) return;
    applyTranslation(lang.code);
  }

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
