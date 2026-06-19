"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { CurrencyCode } from "@/context/CurrencyTypes";
import enStrings from "@/translations/en.json";
import npStrings from "@/translations/np.json";
import deStrings from "@/translations/de.json";
import frStrings from "@/translations/fr.json";
import esStrings from "@/translations/es.json";
import jaStrings from "@/translations/ja.json";
import zhStrings from "@/translations/zh.json";

export type LangCode = "EN" | "NP" | "FR" | "DE" | "ES" | "ZH" | "JA";

export const LANGUAGES = [
  { code: "EN" as LangCode, label: "English",  flag: "🇬🇧" },
  { code: "NP" as LangCode, label: "नेपाली",   flag: "🇳🇵" },
  { code: "FR" as LangCode, label: "Français",  flag: "🇫🇷" },
  { code: "DE" as LangCode, label: "Deutsch",   flag: "🇩🇪" },
  { code: "ES" as LangCode, label: "Español",   flag: "🇪🇸" },
  { code: "ZH" as LangCode, label: "中文",       flag: "🇨🇳" },
  { code: "JA" as LangCode, label: "日本語",     flag: "🇯🇵" },
];

const SUPPORTED_LANGS = new Set<LangCode>(["EN", "NP", "FR", "DE", "ES", "ZH", "JA"]);

// Locale path prefix → LangCode (for URL routing)
export const LOCALE_TO_LANG: Record<string, LangCode> = {
  en: "EN", np: "NP", fr: "FR", de: "DE", es: "ES", zh: "ZH", ja: "JA",
};

export const LANG_TO_LOCALE: Record<LangCode, string> = {
  EN: "en", NP: "np", FR: "fr", DE: "de", ES: "es", ZH: "zh", JA: "ja",
};

// BCP 47 language tags for <html lang> attribute
const LANG_TO_BCP47: Record<LangCode, string> = {
  EN: "en", NP: "ne", FR: "fr", DE: "de", ES: "es", ZH: "zh-CN", JA: "ja",
};

// Browser navigator.language → LangCode
function getBrowserLang(): LangCode {
  if (typeof navigator === "undefined") return "EN";
  const raw = (navigator.language || "").split("-")[0].toUpperCase();
  // Map browser codes to our LangCode
  const map: Record<string, LangCode> = {
    EN: "EN", NE: "NP", FR: "FR", DE: "DE", ES: "ES", ZH: "ZH", JA: "JA",
  };
  return map[raw] ?? "EN";
}

// Country code → LangCode (primary language of country)
const LANG_MAP: Record<string, LangCode> = {
  // German-speaking
  DE: "DE", AT: "DE", LI: "DE", CH: "DE",
  // French-speaking
  FR: "FR", BE: "FR", LU: "FR", MC: "FR",
  // Spanish-speaking
  ES: "ES", MX: "ES", AR: "ES", CO: "ES", PE: "ES",
  CL: "ES", VE: "ES", EC: "ES", BO: "ES", PY: "ES",
  UY: "ES", CR: "ES", PA: "ES", GT: "ES", HN: "ES",
  SV: "ES", NI: "ES", DO: "ES", CU: "ES",
  // Japanese
  JP: "JA",
  // Chinese
  CN: "ZH", TW: "ZH", HK: "ZH", SG: "ZH",
  // Nepali
  NP: "NP",
};

// Countries whose default currency is EUR
const EUR_COUNTRIES = new Set([
  "DE","AT","FR","ES","IT","BE","NL","PT","FI","IE","LU",
  "SK","SI","LT","LV","EE","CY","MT","MC","SM","VA","LI","GR","HR",
]);

// Country-specific currency overrides (non-EUR)
const CURRENCY_MAP: Record<string, CurrencyCode> = {
  NP: "NPR", IN: "INR", GB: "GBP", AU: "AUD", NZ: "AUD",
};

export function countryToCurrency(country: string): CurrencyCode {
  if (EUR_COUNTRIES.has(country)) return "EUR";
  return CURRENCY_MAP[country] ?? "USD";
}

export function countryToLang(country: string): LangCode {
  return LANG_MAP[country] ?? "EN";
}

// ─────────────────────────────────────────────
// Translation dictionary
// ─────────────────────────────────────────────
type Dict = Record<string, string>;

const T: Record<LangCode, Dict> = {
  EN: enStrings as Dict,
  NP: npStrings as Dict,
  DE: deStrings as Dict,
  FR: frStrings as Dict,
  ES: esStrings as Dict,
  ZH: zhStrings as Dict,
  JA: jaStrings as Dict,
};

// Cookie helpers
function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=31536000;SameSite=Lax`;
}

// ─────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────
interface TranslationContextValue {
  lang: LangCode;
  setLang: (code: LangCode) => void;
  t: (key: string) => string;
  geoCurrency: CurrencyCode | null;
}

const TranslationContext = createContext<TranslationContextValue>({
  lang: "EN",
  setLang: () => {},
  t: (k) => T.EN[k] ?? k,
  geoCurrency: null,
});

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("EN");
  const [geoCurrency, setGeoCurrency] = useState<CurrencyCode | null>(null);

  useEffect(() => {
    // Priority: cookie → localStorage → browser lang → IP geo
    const cookieLang = (() => {
      const v = readCookie("gt_lang") as LangCode | null;
      return v && SUPPORTED_LANGS.has(v) ? v : null;
    })();

    const savedLang = cookieLang ?? (() => {
      try { return localStorage.getItem("gt_lang") as LangCode | null; } catch { return null; }
    })();

    const savedCurrency = (() => {
      try { return localStorage.getItem("gt_currency"); } catch { return null; }
    })();

    // 1. Apply saved language preference immediately
    if (savedLang && SUPPORTED_LANGS.has(savedLang)) {
      setLangState(savedLang);
    } else {
      // 2. Fall back to browser language instantly (no async wait)
      const browserLang = getBrowserLang();
      if (browserLang !== "EN") setLangState(browserLang);
    }

    // 3. Skip IP call only if both preferences are already saved
    if (savedLang && savedCurrency) return;

    // 4. IP-based geo-detection for missing preferences
    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((data) => {
        const country: string = data?.country_code ?? "";
        if (!country) return;

        if (!savedLang) {
          const detectedLang = countryToLang(country);
          setLangState(detectedLang);
          try { localStorage.setItem("gt_lang", detectedLang); } catch {}
          writeCookie("gt_lang", detectedLang);
        }

        if (!savedCurrency) {
          const detectedCurrency = countryToCurrency(country);
          setGeoCurrency(detectedCurrency);
          try { localStorage.setItem("gt_currency", detectedCurrency); } catch {}
        }
      })
      .catch(() => {});
  }, []);

  // Keep <html lang> in sync with selected language
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = LANG_TO_BCP47[lang];
    }
  }, [lang]);

  const setLang = useCallback((code: LangCode) => {
    setLangState(code);
    try { localStorage.setItem("gt_lang", code); } catch {}
    writeCookie("gt_lang", code);
  }, []);

  const t = useCallback((key: string): string => {
    return T[lang]?.[key] ?? T.EN[key] ?? key;
  }, [lang]);

  return (
    <TranslationContext.Provider value={{ lang, setLang, t, geoCurrency }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  return useContext(TranslationContext);
}
