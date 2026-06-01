import { NextResponse } from "next/server";

const FALLBACK = { USD: 1, INR: 84.5, EUR: 0.92, NPR: 135.0, GBP: 0.79, AUD: 1.54 };

async function fetchRates(url: string) {
  const res = await fetch(url, { next: { revalidate: 1800 }, cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const r = data?.rates ?? data?.conversion_rates;
  if (!r) throw new Error("No rates field");
  return r;
}

export async function GET() {
  const apis = [
    "https://api.exchangerate-api.com/v4/latest/USD",
    "https://open.er-api.com/v6/latest/USD",
    "https://api.fxratesapi.com/latest?base=USD",
  ];

  for (const url of apis) {
    try {
      const r = await fetchRates(url);
      const rates = {
        USD: 1,
        INR: Number(r.INR) || FALLBACK.INR,
        EUR: Number(r.EUR) || FALLBACK.EUR,
        NPR: Number(r.NPR) || FALLBACK.NPR,
        GBP: Number(r.GBP) || FALLBACK.GBP,
        AUD: Number(r.AUD) || FALLBACK.AUD,
      };
      return NextResponse.json(rates, {
        headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=300" },
      });
    } catch {
      continue;
    }
  }

  return NextResponse.json(FALLBACK, {
    headers: { "Cache-Control": "public, s-maxage=300" },
  });
}
