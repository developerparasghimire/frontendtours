import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://gettours.com.np";

export const metadata: Metadata = {
  title: "Travel Blog — Nepal Trekking Tips, Guides & Inspiration",
  description:
    "Expert Nepal travel tips, trekking route guides, packing checklists, cultural insights, wildlife encounters, and inspiring stories from the Himalayas. Plan your perfect Nepal trip.",
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    title: "Travel Blog | Get Tours Nepal",
    description: "Expert Nepal travel tips, trekking guides & inspiring Himalayan stories.",
    url: `${SITE_URL}/blog`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nepal Travel Blog | Get Tours",
    description: "Expert Nepal travel tips, trekking guides & stories.",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
