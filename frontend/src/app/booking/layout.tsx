import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book a Tour — Complete Your Nepal Adventure Booking",
  description:
    "Complete your booking with Get Tours. Choose your tour, select dates, add travelers, and confirm your Nepal adventure in minutes. Secure online payment.",
  robots: { index: false, follow: false },
};

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
