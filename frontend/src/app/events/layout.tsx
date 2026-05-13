import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://gettours.com.np";

export const metadata: Metadata = {
  title: "Events & Experiences — Festivals, Concerts & Cultural Events in Nepal",
  description:
    "Discover upcoming concerts, cultural walks, Dashain & Tihar festivals, Newari cooking classes, and unique local experiences happening across Nepal. Book tickets with Get Tours.",
  alternates: { canonical: `${SITE_URL}/events` },
  openGraph: {
    title: "Events & Experiences | Get Tours Nepal",
    description: "Concerts, festivals, cultural walks & more — unique Nepal experiences.",
    url: `${SITE_URL}/events`,
    type: "website",
    images: [{ url: "/img/landscape_background_small.jpg", width: 1200, height: 630, alt: "Nepal Events & Experiences" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nepal Events & Experiences | Get Tours",
    description: "Festivals, concerts, cooking classes & cultural walks across Nepal.",
  },
};

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
