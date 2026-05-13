import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://gettours.com.np";

export const metadata: Metadata = {
  title: "Booking Policy — Get Tours Nepal",
  description:
    "Read our booking policy including reservation terms, payment schedules, cancellation rules, and group booking guidelines for tours and events in Nepal.",
  alternates: { canonical: `${SITE_URL}/booking-policy` },
  openGraph: {
    title: "Booking Policy | Get Tours Nepal",
    description: "Reservation terms, payment schedules, cancellation rules, and group booking guidelines.",
    url: `${SITE_URL}/booking-policy`,
    type: "website",
  },
};

export default function BookingPolicyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
