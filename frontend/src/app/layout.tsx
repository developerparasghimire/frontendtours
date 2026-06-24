import type { Metadata } from "next";
import { Inter, Noto_Sans_SC, Noto_Sans_JP, Noto_Sans_Devanagari } from "next/font/google";
import Script from "next/script";
import { headers } from "next/headers";
import "./globals.css";

import ClientRootLayout from "@/components/layout/ClientRootLayout";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-ZFE4MGBSBZ";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

// CJK + Devanagari web fonts — subset-loaded so Latin pages pay no cost
const notoSC = Noto_Sans_SC({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-noto-sc" });
const notoJP = Noto_Sans_JP({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-noto-jp" });
const notoDevanagari = Noto_Sans_Devanagari({ subsets: ["devanagari", "latin"], weight: ["400", "700"], variable: "--font-noto-devanagari" });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://gettoursnepal.com";

// BCP-47 for html lang attribute
const BCP47: Record<string, string> = {
  en: "en", fr: "fr", de: "de", es: "es",
  it: "it", zh: "zh-CN", ja: "ja", hi: "hi", ru: "ru",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Get Tours Nepal — #1 Nepal Travel & Trekking Agency | Book Adventures",
    template: "%s | Get Tours Nepal",
  },
  description:
    "Nepal's most trusted travel agency. Book Everest Base Camp treks, Annapurna circuits, cultural tours, wildlife safaris & local events. 10,000+ happy travelers, 150+ verified packages. Best price guarantee.",
  keywords: [
    "Nepal tours", "trekking Nepal", "Everest base camp trek", "Annapurna circuit trek",
    "Himalaya adventure", "Nepal travel agency", "Kathmandu tours", "Pokhara tours",
    "guided tours Nepal", "Nepal holiday packages", "best Nepal tours",
    "Nepal trekking company", "cultural tours Nepal", "wildlife safari Nepal",
    "Chitwan jungle safari", "Nepal events", "book Nepal tour online",
    "Nepal trip planner", "Nepal adventure travel", "Nepal honeymoon packages",
    "Nepal budget tours", "Nepal luxury travel", "Nepal hiking trails",
    "Lumbini tour", "Nepal pilgrimage tour",
  ],
  authors: [{ name: "Get Tours Nepal" }],
  creator: "Get Tours Nepal",
  publisher: "Get Tours Nepal",
  formatDetection: { email: false, telephone: false },
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Get Tours Nepal",
    title: "Get Tours Nepal — Discover Nepal's Best Adventures",
    description:
      "Book the best local travel experiences, guided tours, trekking adventures, and cultural events across Nepal. Trusted by 10,000+ travelers.",
    url: SITE_URL,
    images: [{ url: "/img/landscape_background_small.jpg", width: 1200, height: 630, alt: "Get Tours Nepal — Himalayan Adventures" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Get Tours Nepal — Discover Nepal's Best Adventures",
    description: "Book the best local travel experiences, guided tours, trekking adventures, and cultural events across Nepal.",
    images: ["/img/landscape_background_small.jpg"],
  },
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  verification: { google: "xH9N1GVOsCJOuUnNeRukQ4tnltHbqq2acphxyU5Z_B4" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "TravelAgency",
      name: "Get Tours Nepal",
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
      description: "Nepal's most trusted travel agency. Book Everest Base Camp treks, Annapurna circuits, cultural tours, wildlife safaris & local events.",
      address: { "@type": "PostalAddress", streetAddress: "Thamel", addressLocality: "Kathmandu", addressCountry: "NP" },
      sameAs: [],
      priceRange: "$$",
      aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", reviewCount: "10000" },
    },
    {
      "@type": "WebSite",
      name: "Get Tours Nepal",
      url: SITE_URL,
      potentialAction: { "@type": "SearchAction", target: `${SITE_URL}/tours?search={search_term_string}`, "query-input": "required name=search_term_string" },
    },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Read locale detected by next-intl middleware — used for html lang attribute
  const headersList = await headers();
  const locale = headersList.get("x-next-intl-locale") ?? "en";
  const htmlLang = BCP47[locale] ?? "en";

  const fontClasses = [inter.variable, notoSC.variable, notoJP.variable, notoDevanagari.variable, inter.className].join(" ");

  return (
    <html lang={htmlLang}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${fontClasses} antialiased`}>
        <ClientRootLayout>{children}</ClientRootLayout>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
      </body>
    </html>
  );
}
