"use client";

import Link from "next/link";
import PageHero from "@/components/sections/PageHero";
import { sectionImages } from "@/lib/sectionImages";
import { usePageBanner } from "@/hooks/usePageBanner";

const sections = [
  {
    title: "1. Introduction",
    items: [
      {
        subtitle: "",
        content:
          "Golden Era Travel and Tours is committed to protecting your personal data and privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our website or services.",
      },
    ],
  },
  {
    title: "2. Information We Collect",
    items: [
      {
        subtitle: "Personal Information",
        content:
          "Full name, nationality, and contact details (email, phone, address); Passport details and identification documents; Travel information (itinerary, preferences, dietary needs); Payment-related information (processed via secure third-party gateways); Health and insurance details (for trekking and safety purposes). We only collect information necessary to provide our services.",
      },
    ],
  },
  {
    title: "3. How We Use Your Information",
    items: [
      {
        subtitle: "",
        content:
          "Your information is used for: processing bookings and arranging travel services; sending confirmations, itineraries, and updates; communicating with you regarding your trip; improving our services and customer experience; and sending promotional materials (only if you opt in).",
      },
    ],
  },
  {
    title: "4. Sharing of Information",
    items: [
      {
        subtitle: "",
        content:
          "We may share your information with trusted third parties only when necessary, including airlines, hotels, and transport providers; government authorities for permits and visas; and payment processors. We do not sell, trade, or rent your personal data to third parties.",
      },
    ],
  },
  {
    title: "5. Data Security",
    items: [
      {
        subtitle: "",
        content:
          "We implement appropriate technical and organizational measures to protect your data. Sensitive information is stored securely, and payment details are processed through secure systems and are not stored on our servers.",
      },
    ],
  },
  {
    title: "6. Cookies & Tracking Technologies",
    items: [
      {
        subtitle: "",
        content:
          "Our website may use cookies and analytics tools (such as Google Analytics) to improve user experience and understand website usage. You may choose to disable cookies through your browser settings.",
      },
    ],
  },
  {
    title: "7. Data Retention",
    items: [
      {
        subtitle: "",
        content:
          "We retain your personal information only as long as necessary to fulfill booking and legal obligations and maintain business and tax records. After this period, data is securely deleted or anonymized.",
      },
    ],
  },
  {
    title: "8. Your Rights",
    items: [
      {
        subtitle: "",
        content:
          "Depending on applicable laws, you have the right to access your personal data; request correction of inaccurate information; request deletion of your data (where applicable); and withdraw consent for marketing communications. Requests can be made by contacting us directly.",
      },
    ],
  },
  {
    title: "9. Third-Party Links",
    items: [
      {
        subtitle: "",
        content:
          "Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of those external sites.",
      },
    ],
  },
  {
    title: "10. Legal Compliance",
    items: [
      {
        subtitle: "",
        content:
          "We comply with applicable data protection laws including Nepal's Individual Privacy Act 2075 (2018) and Electronic Transactions Act 2063 (2006). Where applicable, we follow international data protection standards for handling foreign client data.",
      },
    ],
  },
  {
    title: "11. Policy Updates",
    items: [
      {
        subtitle: "",
        content:
          "We reserve the right to update this Privacy Policy at any time. Changes will be posted on this page, and users are encouraged to review it periodically.",
      },
    ],
  },
  {
    title: "12. Consent",
    items: [
      {
        subtitle: "",
        content:
          "By using our website and services, you consent to the collection and use of your information as outlined in this Privacy Policy.",
      },
    ],
  },
  {
    title: "13. Contact Us",
    items: [
      {
        subtitle: "",
        content:
          "If you have any questions regarding this Privacy Policy or your data, please contact us at: Golden Era Travel and Tours, Kathmandu 16, Naya Bazar, Swayambhu Marg, Nepal. Email: gettoursnepal@gmail.com | Phone/WhatsApp: +977 9768510607",
      },
    ],
  },
];

export default function PrivacyPage() {
  const banner = usePageBanner("privacy");
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <PageHero
        title={banner?.title || "Privacy Policy"}
        subtitle={banner?.subtitle || "Legal"}
        description={banner?.description || "How we collect, use, and protect your personal information. Your privacy matters to us."}
        accentColor="brand-red"
        backgroundImage={sectionImages.aboutWhoWeAre}
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
                <div className="space-y-4">
                  {section.items.map((item, i) => (
                    <div key={i}>
                      {item.subtitle && (
                        <h3 className="font-semibold text-brand-navy text-sm mb-1">{item.subtitle}</h3>
                      )}
                      <p className="text-gray-600 text-sm leading-relaxed">{item.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          Also see our{" "}
          <Link href="/terms" className="text-brand-red font-semibold hover:underline">
            Terms of Service
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
