import type { Metadata } from "next";
import type { ReactNode } from "react";
import { routing } from "@/routing";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://gettoursnepal.com";

// BCP-47 codes for the html lang attribute
const BCP47: Record<string, string> = {
  en: "en", fr: "fr", de: "de", es: "es",
  it: "it", zh: "zh-CN", ja: "ja", hi: "hi", ru: "ru",
};

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  // Build hreflang alternates for every locale
  const languages: Record<string, string> = { "x-default": SITE_URL };
  for (const loc of routing.locales) {
    languages[BCP47[loc] ?? loc] =
      loc === routing.defaultLocale ? SITE_URL : `${SITE_URL}/${loc}`;
  }

  return {
    alternates: { languages },
    // Set the html lang via OpenGraph locale (Next.js infers lang attribute from this)
    openGraph: { locale: BCP47[locale] ?? locale },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  // Params are only needed so Next.js generates one layout per locale;
  // the actual html lang attribute is set in the root layout via the
  // x-next-intl-locale request header.
  await params; // consume to avoid unused-param warning
  return <>{children}</>;
}
