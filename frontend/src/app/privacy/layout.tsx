import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://gettours.com.np";

export const metadata: Metadata = {
  title: "Privacy Policy — Get Tours Nepal",
  description:
    "Learn how Get Tours Nepal collects, uses, and protects your personal information when you use our travel booking platform.",
  alternates: { canonical: `${SITE_URL}/privacy` },
  openGraph: {
    title: "Privacy Policy | Get Tours Nepal",
    description: "How we collect, use, and protect your personal information.",
    url: `${SITE_URL}/privacy`,
    type: "website",
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
