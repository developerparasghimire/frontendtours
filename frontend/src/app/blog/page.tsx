import ClientBlogPage from "./ClientBlogPage";

export const metadata = {
  title: "Nepal Travel Blog — Trekking Guides, Tips & Stories | Get Tours Nepal",
  description:
    "Explore expert trekking guides, Nepal travel tips, cultural stories, packing lists, and first-hand adventure accounts. Insights from local Sherpa guides with 8+ years on the Himalayan trails.",
  keywords: [
    "Nepal travel blog",
    "trekking guides Nepal",
    "Everest base camp guide",
    "Annapurna trek tips",
    "Nepal travel tips",
    "Himalayan travel blog",
    "Nepal culture stories",
    "Nepal packing list",
    "Kathmandu travel guide",
    "Nepal adventure blog",
    "Sherpa guide stories",
    "Nepal trekking advice",
  ],
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Nepal Travel Blog — Trekking Guides, Cultural Stories & Tips",
    description:
      "Expert trekking guides, Nepal travel tips, and cultural stories from local Sherpa guides. Inspiration for your next Himalayan adventure.",
    url: "/blog",
    siteName: "Get Tours Nepal",
    images: [
      {
        url: "/img/landscape_background_small.jpg",
        width: 1200,
        height: 630,
        alt: "Nepal Himalayan travel blog — Get Tours Nepal",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nepal Travel Blog — Get Tours Nepal",
    description: "Expert Himalayan trekking guides, Nepal travel tips, and cultural stories from local Sherpa guides.",
    images: ["/img/landscape_background_small.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
  },
};

export default function BlogPage() {
  return <ClientBlogPage />;
}
