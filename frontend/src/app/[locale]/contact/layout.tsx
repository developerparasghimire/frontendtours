import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://gettours.com.np";

export const metadata: Metadata = {
  title: "Contact Us — Get in Touch With Get Tours Nepal",
  description:
    "Contact Get Tours for custom Nepal itineraries, group bookings, corporate retreats, or event partnerships. Visit us in Thamel, Kathmandu. We reply within 24 hours.",
  alternates: { canonical: `${SITE_URL}/contact` },
  openGraph: {
    title: "Contact Us | Get Tours Nepal",
    description: "Get in touch for tour packages, custom itineraries, and partnerships.",
    url: `${SITE_URL}/contact`,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Contact Get Tours Nepal",
    description: "Reach out for custom Nepal tours and group bookings.",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
