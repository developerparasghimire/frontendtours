import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://gettours.com.np";

export const metadata: Metadata = {
  title: "Tour Packages — Trekking, Cultural & Adventure Tours in Nepal",
  description:
    "Explore 150+ Nepal tour packages — Everest Base Camp treks, Annapurna circuits, cultural day trips, wildlife safaris & more. Filter by difficulty, category & destination. Book your adventure today with Get Tours Nepal.",
  alternates: { canonical: `${SITE_URL}/tours` },
  openGraph: {
    title: "All Tour Packages | Get Tours Nepal",
    description:
      "Explore Nepal tour packages — from day trips to multi-week treks. Trekking, adventure, cultural, wildlife & spiritual tours.",
    url: `${SITE_URL}/tours`,
    type: "website",
    images: [{ url: "/img/landscape_background_small.jpg", width: 1200, height: 630, alt: "Nepal Tour Packages" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nepal Tour Packages | Get Tours",
    description: "150+ verified Nepal tours — trekking, cultural, adventure & more.",
  },
};

export default function ToursLayout({ children }: { children: React.ReactNode }) {
  return children;
}
