import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://gettours.com.np";

export const metadata: Metadata = {
  title: "FAQs — Frequently Asked Questions | Get Tours Nepal",
  description:
    "Find answers to common questions about booking tours in Nepal, cancellations, payment methods, travel requirements, and more.",
  alternates: { canonical: `${SITE_URL}/faqs` },
  openGraph: {
    title: "FAQs | Get Tours Nepal",
    description: "Common questions about tours, bookings, payments, and travel in Nepal.",
    url: `${SITE_URL}/faqs`,
    type: "website",
  },
};

export default function FAQsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
