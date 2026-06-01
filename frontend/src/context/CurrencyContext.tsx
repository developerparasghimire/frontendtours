"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

export type CurrencyCode = "USD" | "INR" | "EUR" | "NPR" | "GBP" | "AUD";

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  label: string;
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: "USD", symbol: "$",   label: "USD ($)"   },
  { code: "INR", symbol: "₹",   label: "INR (₹)"   },
  { code: "EUR", symbol: "€",   label: "EUR (€)"   },
  { code: "NPR", symbol: "Rs.", label: "NPR (Rs.)" },
  { code: "GBP", symbol: "£",   label: "GBP (£)"   },
  { code: "AUD", symbol: "A$",  label: "AUD (A$)"  },
];

const FALLBACK_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  INR: 84.5,
  EUR: 0.92,
  NPR: 135.0,
  GBP: 0.79,
  AUD: 1.54,
};

const CACHE_KEY    = "gt_fx_rates_v2";
const CACHE_TS_KEY = "gt_fx_rates_ts_v2";
const CACHE_TTL    = 30 * 60 * 1000; // 30 minutes

interface CurrencyContextValue {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  formatPrice: (usdAmount: number) => string;
  currencyInfo: CurrencyInfo;
  rates: Record<CurrencyCode, number>;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: "USD",
  setCurrency: () => {},
  formatPrice: (a) => (a ? `$${a.toLocaleString()}` : "Free"),
  currencyInfo: CURRENCIES[0],
  rates: FALLBACK_RATES,
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("USD");
  const [rates, setRates] = useState<Record<CurrencyCode, number>>(FALLBACK_RATES);

  // Restore saved currency preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem("gt_currency") as CurrencyCode | null;
      if (saved && CURRENCIES.some((c) => c.code === saved)) setCurrencyState(saved);
    } catch {}
  }, []);

  // Fetch live rates via internal Next.js API route (server-side fetch, no CORS)
  useEffect(() => {
    async function loadRates() {
      // Use cache if fresh
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        const ts = Number(localStorage.getItem(CACHE_TS_KEY) || 0);
        if (cached && Date.now() - ts < CACHE_TTL) {
          setRates(JSON.parse(cached));
          return;
        }
      } catch {}

      // Fetch from our internal API route
      try {
        const res = await fetch("/api/exchange-rates");
        if (!res.ok) throw new Error("API error");
        const data: Record<CurrencyCode, number> = await res.json();
        setRates(data);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(data));
          localStorage.setItem(CACHE_TS_KEY, String(Date.now()));
        } catch {}
      } catch {
        // Silently use fallback rates already set in state
      }
    }

    loadRates();
  }, []);

  const setCurrency = useCallback((code: CurrencyCode) => {
    setCurrencyState(code);
    try { localStorage.setItem("gt_currency", code); } catch {}
  }, []);

  const formatPrice = useCallback(
    (usdAmount: number): string => {
      if (!usdAmount) return "Free";
      const info = CURRENCIES.find((c) => c.code === currency)!;
      const converted = usdAmount * rates[currency];
      const formatted =
        converted >= 1000
          ? Math.round(converted).toLocaleString()
          : converted >= 1
            ? Number(converted.toFixed(2)).toLocaleString()
            : converted.toFixed(4);
      return `${info.symbol}${formatted}`;
    },
    [currency, rates],
  );

  const currencyInfo = CURRENCIES.find((c) => c.code === currency) ?? CURRENCIES[0];

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, currencyInfo, rates }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
