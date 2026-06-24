import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://gettours.com.np";

export const metadata: Metadata = {
  title: "Terms of Service — Get Tours Nepal",
  description:
    "Read our terms of service governing the use of Get Tours Nepal platform, tour participation, liability, and user responsibilities.",
  alternates: { canonical: `${SITE_URL}/terms` },
  openGraph: {
    title: "Terms of Service | Get Tours Nepal",
    description: "Terms governing use of Get Tours Nepal platform and tour participation.",
    url: `${SITE_URL}/terms`,
    type: "website",
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
