"use client";

import Link from "next/link";
import PageHero from "@/components/sections/PageHero";
import { sectionImages } from "@/lib/sectionImages";
import { usePageBanner } from "@/hooks/usePageBanner";

const sections = [
  {
    title: "1. Contract & Booking Acceptance",
    content:
      "A binding contract is formed once a booking is confirmed and the required deposit is received. These Terms apply to all direct bookings; third-party bookings may also be subject to additional agent terms.",
  },
  {
    title: "2. Scope of Services",
    content:
      "Golden Era Travel and Tours provides travel-related services including tours, treks, transport, and accommodations. All services are subject to availability, local conditions, and operational feasibility.",
  },
  {
    title: "3. Itinerary Changes & Flexibility",
    content:
      "We reserve the right to modify or cancel any part of the itinerary due to unforeseen circumstances such as weather, strikes, government actions, or safety concerns. Any additional costs arising from such changes shall be borne by the client.",
  },
  {
    title: "4. Pricing & Additional Costs",
    content:
      "Trip prices include only the services specifically listed in the confirmed itinerary. Any extra costs due to changes, delays, or personal requirements are the responsibility of the client.",
  },
  {
    title: "5. Liability & Risk Disclaimer",
    content:
      "Golden Era Travel and Tours acts as an organizer and intermediary and shall not be held liable for: accidents, injuries, illness, or death during the trip; loss, damage, or delay caused by third-party providers; or natural disasters, strikes, or unforeseen events. All travel involves inherent risks, and clients accept full responsibility for participation.",
  },
  {
    title: "6. Force Majeure",
    content:
      "We are not responsible for cancellations, delays, or changes caused by events beyond our control, including but not limited to natural disasters, political unrest, pandemics, or transportation disruptions. Refunds, if applicable, will be limited to recoverable amounts only.",
  },
  {
    title: "7. Health, Fitness & Medical Disclosure",
    content:
      "Clients must disclose any pre-existing medical conditions at the time of booking. Failure to do so may result in cancellation without refund if the condition affects participation.",
  },
  {
    title: "8. Conduct & Compliance",
    content:
      "Clients must comply with local laws, regulations, and safety guidelines. Any illegal or disruptive behavior may result in removal from the trip without refund or compensation.",
  },
  {
    title: "9. Travel Documentation",
    content:
      "Clients are responsible for obtaining and carrying valid passports, visas, permits, and other required documents. We are not liable for any issues arising from incomplete or incorrect documentation.",
  },
  {
    title: "10. Insurance Requirement",
    content:
      "Comprehensive travel insurance is strongly recommended and may be mandatory for certain trips. It should cover medical expenses, accidents, evacuation, and trip cancellation.",
  },
  {
    title: "11. Unaccompanied Minors",
    content:
      "Unaccompanied minors are generally not accepted unless accompanied by a legal guardian or with prior arrangement.",
  },
  {
    title: "12. Cancellations & Refunds",
    content:
      "Cancellation policies are governed by our Booking Policy. No refunds will be provided for unused services, no-shows, or early departures once the trip has commenced.",
  },
  {
    title: "13. Changes by Client",
    content:
      "Requests to modify bookings must be submitted prior to 3 days and must be communicated clearly to Golden Era Travel and Tours staff members. Changes are subject to availability and may incur additional charges.",
  },
  {
    title: "14. Intellectual Property & Website Use",
    content:
      "All content on our website, including text, images, and materials, is protected by copyright. Unauthorized use, reproduction, or distribution is strictly prohibited.",
  },
  {
    title: "15. Publicity & Media Use",
    content:
      "We reserve the right to use photographs and videos taken during trips for promotional purposes unless the client requests otherwise in writing.",
  },
  {
    title: "16. Information Accuracy Disclaimer",
    content:
      "All information on our website is provided for general guidance. Clients use this information at their own risk, and we do not guarantee absolute accuracy at all times.",
  },
  {
    title: "17. Governing Law & Jurisdiction",
    content:
      "These Terms are governed by the laws of Nepal. Any disputes shall be subject to the jurisdiction of courts in Kathmandu, Nepal.",
  },
  {
    title: "18. Acceptance of Terms",
    content:
      "By booking a trip with Golden Era Travel and Tours, you acknowledge that you have read, understood, and agreed to these Terms of Service.",
  },
];

export default function TermsPage() {
  const banner = usePageBanner("terms");
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <PageHero
        title={banner?.title || "Terms of Service"}
        subtitle={banner?.subtitle || "Legal"}
        description={banner?.description || "The rules and guidelines that govern your use of Get Tours Nepal platform and services."}
        accentColor="brand-orange"
        backgroundImage={sectionImages.homeNewsletter}
        compact
      />

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 sm:p-10">
            <p className="text-gray-500 text-sm mb-8">Last updated: March 1, 2026</p>
            
            {sections.map((section) => (
              <div key={section.title} className="mb-8 last:mb-0">
                <h2 className="text-lg sm:text-xl font-bold text-brand-navy mb-3 pb-2 border-b border-gray-100">
                  {section.title}
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed">{section.content}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          Also see our{" "}
          <Link href="/privacy" className="text-brand-red font-semibold hover:underline">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link href="/booking-policy" className="text-brand-red font-semibold hover:underline">
            Booking Policy
          </Link>.
        </div>
      </div>
    </div>
  );
}
