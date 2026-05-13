import type { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact Us — Plan Your Nepal Trek | Get Tours Nepal",
  description:
    "Get in touch with Get Tours Nepal. Plan a custom Himalayan trek, book a guaranteed tour, or ask any question. We reply within 24 hours. Located in Thamel, Kathmandu.",
  keywords: [
    "contact Get Tours Nepal",
    "Nepal trekking inquiry",
    "book Nepal tour",
    "custom Nepal itinerary",
    "Nepal travel agent contact",
    "Kathmandu tour operator",
    "Thamel travel agency",
  ],
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Get Tours Nepal — Plan Your Himalayan Adventure",
    description:
      "Reach our local team in Thamel, Kathmandu. Custom itineraries, tour bookings, and 24-hour response guaranteed.",
    url: "/contact",
    images: [
      {
        url: "/img/landscape_background_small.jpg",
        width: 1200,
        height: 630,
        alt: "Contact Get Tours Nepal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Get Tours Nepal",
    description: "Plan your custom Nepal trek. Our Kathmandu team replies within 24 hours.",
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
