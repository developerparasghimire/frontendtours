"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { CurrencyCode } from "@/context/CurrencyTypes";
import enStrings from "@/translations/en.json";
import deStrings from "@/translations/de.json";
import frStrings from "@/translations/fr.json";
import esStrings from "@/translations/es.json";
import itStrings from "@/translations/it.json";
import jaStrings from "@/translations/ja.json";
import ruStrings from "@/translations/ru.json";
import zhStrings from "@/translations/zh.json";
import hiStrings from "@/translations/hi.json";

export type LangCode = "EN" | "DE" | "FR" | "ES" | "IT" | "JA" | "RU" | "ZH" | "HI";

export const LANGUAGES = [
  { code: "EN" as LangCode, label: "English",  flag: "🇬🇧" },
  { code: "DE" as LangCode, label: "Deutsch",  flag: "🇩🇪" },
  { code: "FR" as LangCode, label: "Français", flag: "🇫🇷" },
  { code: "ES" as LangCode, label: "Español",  flag: "🇪🇸" },
  { code: "IT" as LangCode, label: "Italiano", flag: "🇮🇹" },
  { code: "JA" as LangCode, label: "日本語",    flag: "🇯🇵" },
  { code: "RU" as LangCode, label: "Русский",  flag: "🇷🇺" },
  { code: "ZH" as LangCode, label: "中文",      flag: "🇨🇳" },
  { code: "HI" as LangCode, label: "हिन्दी",    flag: "🇮🇳" },
];

const SUPPORTED_LANGS = new Set<LangCode>(["EN", "DE", "FR", "ES", "IT", "JA", "RU", "ZH", "HI"]);

// Browser navigator.language → LangCode
function getBrowserLang(): LangCode {
  if (typeof navigator === "undefined") return "EN";
  const code = (navigator.language || "").split("-")[0].toUpperCase() as LangCode;
  return SUPPORTED_LANGS.has(code) ? code : "EN";
}

// Country code → LangCode (primary language of country)
const LANG_MAP: Record<string, LangCode> = {
  DE: "DE", AT: "DE", LI: "DE", CH: "DE",
  FR: "FR", BE: "FR", LU: "FR", MC: "FR",
  ES: "ES", MX: "ES", AR: "ES", CO: "ES", PE: "ES",
  CL: "ES", VE: "ES", EC: "ES", BO: "ES", PY: "ES",
  UY: "ES", CR: "ES", PA: "ES", GT: "ES", HN: "ES",
  SV: "ES", NI: "ES", DO: "ES", CU: "ES",
  IT: "IT", SM: "IT", VA: "IT",
  JP: "JA",
  RU: "RU", BY: "RU", KZ: "RU",
  CN: "ZH", TW: "ZH", HK: "ZH", SG: "ZH",
  IN: "HI",
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
  DE: deStrings as Dict,
  FR: frStrings as Dict,
  ES: esStrings as Dict,
  IT: itStrings as Dict,
  JA: jaStrings as Dict,
  RU: ruStrings as Dict,
  ZH: zhStrings as Dict,
  HI: hiStrings as Dict,
};


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
    const savedLang = (() => {
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
        }

        if (!savedCurrency) {
          const detectedCurrency = countryToCurrency(country);
          setGeoCurrency(detectedCurrency);
          try { localStorage.setItem("gt_currency", detectedCurrency); } catch {}
        }
      })
      .catch(() => {});
  }, []);

  const setLang = useCallback((code: LangCode) => {
    setLangState(code);
    try { localStorage.setItem("gt_lang", code); } catch {}
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
