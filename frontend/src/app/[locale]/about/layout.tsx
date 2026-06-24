import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://gettours.com.np";

export const metadata: Metadata = {
  title: "About Us — Nepal's Trusted Trekking & Travel Company | 25+ Years Experience",
  description:
    "Learn about Get Tours — Nepal's premier trekking and travel platform. 25+ years of experience with certified Sherpa guides, 10,000+ happy travelers, and a commitment to sustainable Himalayan tourism.",
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: "About Us | Get Tours Nepal",
    description: "Nepal's premier trekking and travel platform. 25+ years of experience with local Sherpa guides.",
    url: `${SITE_URL}/about`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Get Tours Nepal",
    description: "Nepal's premier trekking company — 25+ years of Himalayan expertise.",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
