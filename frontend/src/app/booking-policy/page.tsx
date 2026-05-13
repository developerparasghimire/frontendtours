"use client";

import Link from "next/link";
import PageHero from "@/components/sections/PageHero";
import { sectionImages } from "@/lib/sectionImages";
import { usePageBanner } from "@/hooks/usePageBanner";

const sections = [
  {
    title: "1. Booking Confirmation",
    content: [
      "A booking is confirmed once we receive your completed booking form and the required deposit payment.",
      "A confirmation email with full trip details will be sent after verification.",
    ],
  },
  {
    title: "2. Deposit Requirement",
    content: [
      "A deposit of 20%–30% of the total trip cost is required to secure your booking.",
      "Some trips (luxury tours, peak season, flights) may require a higher deposit.",
    ],
  },
  {
    title: "3. Final Payment",
    content: [
      "The remaining balance must be paid before arrival or upon arrival in Nepal, as specified in your invoice.",
      "Failure to complete payment may result in cancellation of services.",
    ],
  },
  {
    title: "4. Payment Methods",
    content: [
      "Bank transfer (international or local)",
      "Online payment platforms",
      "Card Payment",
      "Cash payment upon arrival (USD)",
      "Note: Any bank or transaction charges must be covered by the client.",
    ],
  },
  {
    title: "5. Last-Minute Bookings",
    content: [
      "Bookings made less than 7 days before departure require full payment at the time of booking.",
      "Availability of services may be limited for last-minute bookings.",
    ],
  },
  {
    title: "6. Pricing & Validity",
    content: [
      "All prices are quoted in USD unless otherwise stated and are subject to change without prior notice due to government taxes, flight fare changes, or exchange rate fluctuations.",
      "Once confirmed, prices remain fixed for the booked services.",
    ],
  },
  {
    title: "7. Required Documents",
    content: [
      "Valid passport copy",
      "Travel insurance (for trekking/adventure trips)",
      "Failure to provide documents may affect your trip.",
    ],
  },
  {
    title: "8. Travel Insurance",
    content: [
      "Comprehensive travel insurance is mandatory for trekking and adventure activities.",
      "It must cover emergency evacuation, medical expenses, and trip cancellation.",
    ],
  },
  {
    title: "9. Special Requests",
    content: [
      "Any special requests (dietary, accommodation, medical needs) must be communicated at the time of booking.",
      "We will do our best to accommodate but cannot guarantee all requests.",
    ],
  },
  {
    title: "10. Changes to Booking",
    content: [
      "Changes to confirmed bookings are subject to availability and may incur additional costs (if applicable).",
      "We recommend informing us as early as possible.",
    ],
  },
  {
    title: "11. Cancellation by Client",
    content: [
      "More than 30 days before trip: Deposit retained",
      "15–30 days before trip: 50% of total cost",
      "Less than 15 days: 100% of total cost",
    ],
  },
  {
    title: "12. Cancellation by Company",
    content: [
      "We reserve the right to cancel trips due to natural disasters, political instability, or safety concerns.",
      "In such cases, alternative arrangements or refunds will be offered.",
    ],
  },
  {
    title: "13. Unused Services",
    content: [
      "No refunds will be provided for missed tours or activities, early departure, or unused services during the trip.",
    ],
  },
  {
    title: "14. Responsibility",
    content: [
      "Golden Era Travel and Tours acts as a service provider and is not liable for delays, cancellations, or changes beyond our control.",
      "We are not liable for loss, injury, or damage during travel.",
    ],
  },
  {
    title: "15. Acceptance of Terms",
    content: [
      "By confirming a booking with us, you agree to this Booking Policy along with our Terms of Service.",
    ],
  },
];

export default function BookingPolicyPage() {
  const banner = usePageBanner("booking-policy");
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <PageHero
        title={banner?.title || "Booking Policy"}
        subtitle={banner?.subtitle || "Policies"}
        description={banner?.description || "Please read our booking terms carefully before making a reservation. We want to ensure a smooth experience for every traveler."}
        accentColor="brand-green"
        backgroundImage={sectionImages.aboutAdventure}
        compact
      />

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 sm:p-10">
            <p className="text-gray-500 text-sm mb-8">Last updated: March 1, 2026</p>
            
            {sections.map((section) => (
              <div key={section.title} className="mb-10 last:mb-0">
                <h2 className="text-lg sm:text-xl font-bold text-brand-navy mb-4 pb-2 border-b border-gray-100">
                  {section.title}
                </h2>
                <ul className="space-y-3">
                  {section.content.map((item, i) => (
                    <li key={i} className="flex gap-3 text-gray-600 text-sm leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-blue mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          Have questions about our booking policy?{" "}
          <Link href="/contact" className="text-brand-red font-semibold hover:underline">
            Contact us
          </Link>{" "}
          or visit our{" "}
          <Link href="/faqs" className="text-brand-red font-semibold hover:underline">
            FAQs
          </Link>.
        </div>
      </div>
    </div>
  );
}
