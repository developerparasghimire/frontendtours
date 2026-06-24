import { defineRouting } from "next-intl/routing";

export const LOCALE_LIST = ["en", "fr", "de", "es", "it", "zh", "ja", "hi", "ru"] as const;
export type Locale = (typeof LOCALE_LIST)[number];

export const routing = defineRouting({
  locales: LOCALE_LIST,
  defaultLocale: "en",
  // English keeps existing clean URLs (/tours); other locales get prefix (/de/tours)
  localePrefix: "as-needed",
  // Persist locale in cookie so middleware can restore it on un-prefixed English URLs
  localeCookie: { name: "NEXT_LOCALE", maxAge: 60 * 60 * 24 * 365 },
});
