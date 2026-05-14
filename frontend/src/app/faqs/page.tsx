"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import PageHero from "@/components/sections/PageHero";
import { sectionImages } from "@/lib/sectionImages";
import { usePageBanner } from "@/hooks/usePageBanner";

const faqs = [
  {
    category: "General Information",
    items: [
      {
        q: "Where is Golden Era Travel and Tours based?",
        a: "We are a legally registered travel company based in Kathmandu 16, Naya Bazar, Swayambhu Marg.",
      },
      {
        q: "What types of tours do you offer?",
        a: "We offer cultural tours, trekking, adventure trips, wellness tours, and customized travel packages across Nepal.",
      },
      {
        q: "Are your guides experienced and licensed?",
        a: "Yes, all our guides are government-licensed and have extensive experience in tourism.",
      },
      {
        q: "Can I customize my itinerary?",
        a: "Absolutely, we specialize in tailor-made trips based on your preferences and schedule.",
      },
      {
        q: "Do you organize groups as well as private tours?",
        a: "Yes, we offer both private and group tours depending on your requirement.",
      },
    ],
  },
  {
    category: "Booking & Payments",
    items: [
      {
        q: "How can I book a tour with you?",
        a: "You can book directly through our website, email, or by contacting our team via WhatsApp.",
      },
      {
        q: "Do I need to pay a deposit to confirm my booking?",
        a: "Yes, a deposit is required to secure your booking, with the balance payable before arrival or upon arrival.",
      },
      {
        q: "What payment methods do you accept?",
        a: "We accept bank transfers, online payments, Card Payments and major international payment platforms.",
      },
      {
        q: "Is my payment secure?",
        a: "Yes, we use secure payment systems to ensure your transactions are safe.",
      },
      {
        q: "Will I receive a booking confirmation?",
        a: "Yes, you will receive a confirmation email with all trip details once your booking is confirmed.",
      },
    ],
  },
  {
    category: "Travel & Preparation",
    items: [
      {
        q: "Do I need a visa to visit Nepal?",
        a: "Most travelers can obtain a visa on arrival at Kathmandu Airport. You can check about Visa information on immigration.gov.np.",
      },
      {
        q: "What is the best time to visit Nepal?",
        a: "Spring (March–May) and Autumn (September–November) offer the best weather for travel and trekking.",
      },
      {
        q: "What should I pack for my trip?",
        a: "Packing depends on your trip, but generally includes comfortable clothing, trekking gear, and personal essentials.",
      },
      {
        q: "Do you provide airport pickup and drop-off?",
        a: "Yes, we provide airport transfers for all our guests.",
      },
      {
        q: "Is travel insurance required?",
        a: "Yes, we strongly recommend travel insurance, especially for trekking and adventure activities.",
      },
    ],
  },
  {
    category: "Trekking & Safety",
    items: [
      {
        q: "Do I need prior trekking experience?",
        a: "Not necessarily; we offer treks suitable for beginners to experienced trekkers.",
      },
      {
        q: "How do you ensure safety during trips?",
        a: "We follow strict safety protocols, provide experienced guides, and monitor conditions throughout the journey.",
      },
      {
        q: "What happens in case of an emergency?",
        a: "We arrange immediate assistance, including evacuation if necessary.",
      },
      {
        q: "Are permits required for trekking?",
        a: "Yes, necessary permits are required and we handle all arrangements for you.",
      },
      {
        q: "Do you provide trekking equipment?",
        a: "We can arrange rental or purchase of trekking gear upon request.",
      },
    ],
  },
  {
    category: "Accommodation & Food",
    items: [
      {
        q: "What type of accommodation is provided?",
        a: "We offer a range from budget to luxury hotels and teahouses depending on your package.",
      },
      {
        q: "Are meals included in the tour?",
        a: "Meals depend on the package; trekking tours usually include full board meals.",
      },
      {
        q: "Can you accommodate dietary restrictions?",
        a: "Yes, we can arrange meals based on dietary requirements with prior notice.",
      },
    ],
  },
  {
    category: "Cancellation & Other Services",
    items: [
      {
        q: "Can I modify my booking after confirmation?",
        a: "Yes, changes can be made depending on availability and conditions.",
      },
      {
        q: "What is your cancellation policy?",
        a: "Cancellation terms vary by package; details will be provided at the time of booking.",
      },
      {
        q: "Do you offer travel insurance?",
        a: "We do not provide insurance directly but can recommend trusted providers.",
      },
      {
        q: "Can you arrange domestic flights within Nepal?",
        a: "Yes, we can arrange domestic flights as part of your itinerary.",
      },
      {
        q: "Do you provide support during the trip?",
        a: "Yes, our team is available 24/7 to assist you throughout your journey.",
      },
      {
        q: "Is Nepal safe for travelers?",
        a: "Yes, Nepal is generally safe and welcoming for tourists.",
      },
      {
        q: "How can I contact you during my trip?",
        a: "You can reach us anytime via phone, WhatsApp, or email.",
      },
    ],
  },
];

/* ─── accent colours per category ─── */
const categoryMeta = [
  { color: "bg-brand-red/10 text-brand-red border-brand-red/20", dot: "bg-brand-red" },
  { color: "bg-brand-orange/10 text-brand-orange border-brand-orange/20", dot: "bg-brand-orange" },
  { color: "bg-brand-blue/10 text-brand-blue border-brand-blue/20", dot: "bg-brand-blue" },
  { color: "bg-brand-green/10 text-brand-green border-brand-green/20", dot: "bg-brand-green" },
  { color: "bg-purple-500/10 text-purple-600 border-purple-500/20", dot: "bg-purple-500" },
  { color: "bg-teal-500/10 text-teal-600 border-teal-500/20", dot: "bg-teal-500" },
];

export default function FAQsPage() {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const banner = usePageBanner("faqs");

  const toggle = (key: string) => setOpenKey(openKey === key ? null : key);

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHero
        title={banner?.title || "Frequently Asked Questions"}
        subtitle={banner?.subtitle || "Help Center"}
        description={banner?.description || "Everything you need to know about booking tours, traveling in Nepal, and making the most of your adventure."}
        accentColor="brand-orange"
        backgroundImage={sectionImages.homeAboutInset}
        compact
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">

        {faqs.map((section, si) => {
          const meta = categoryMeta[si % categoryMeta.length];
          return (
            <div key={section.category} className="mb-12">

              {/* Category header */}
              <div className="flex items-center gap-3 mb-5">
                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-xl text-xs font-black border ${meta.color}`}>
                  {si + 1}
                </span>
                <h2 className="text-lg sm:text-xl font-black text-brand-navy tracking-tight">{section.category}</h2>
                <div className="flex-1 h-px bg-slate-200 ml-2" />
              </div>

              {/* Accordion items */}
              <div className="space-y-2.5">
                {section.items.map((item, qi) => {
                  const key = `${si}-${qi}`;
                  const isOpen = openKey === key;
                  return (
                    <div
                      key={key}
                      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                        isOpen
                          ? "bg-white border-slate-200 shadow-[0_8px_24px_-6px_rgba(15,23,42,0.12)]"
                          : "bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm"
                      }`}
                    >
                      {/* Question button */}
                      <button
                        onClick={() => toggle(key)}
                        aria-expanded={isOpen}
                        className="w-full text-left px-5 sm:px-6 py-4 sm:py-5 flex items-start gap-4 group"
                      >
                        <span className={`flex-1 font-semibold text-sm sm:text-base leading-snug transition-colors duration-200 ${isOpen ? "text-brand-navy" : "text-slate-700 group-hover:text-brand-navy"}`}>
                          {item.q}
                        </span>

                        {/* +/− icon */}
                        <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isOpen ? "bg-brand-red text-white rotate-45" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                        }`}>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                          </svg>
                        </span>
                      </button>

                      {/* Animated answer */}
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            key="answer"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 sm:px-6 pb-5 pt-1 pl-[3.25rem]">
                              <div className="h-px bg-slate-100 mb-4" />
                              <p className="text-slate-500 text-sm sm:text-[0.9rem] leading-relaxed">{item.a}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Contact CTA */}
        <div className="mt-6 relative overflow-hidden rounded-3xl bg-brand-navy px-8 sm:px-12 py-10 sm:py-14 text-center">
          <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:36px_36px]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[200px] bg-brand-red/15 rounded-full blur-[80px] pointer-events-none" />
          <div className="relative z-10">
            <p className="inline-flex items-center gap-2 text-brand-orange text-[0.65rem] font-black tracking-[0.28em] uppercase mb-4">
              <span className="w-4 h-px bg-brand-orange" />Still need help?<span className="w-4 h-px bg-brand-orange" />
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-3 tracking-tight">Can&apos;t find your answer?</h3>
            <p className="text-white/50 text-sm sm:text-base mb-8 max-w-sm mx-auto leading-relaxed">
              Our team is ready to help. Send us a message and we&apos;ll reply within 24 hours.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2.5 bg-brand-red text-white font-bold px-8 py-3.5 rounded-2xl hover:bg-[#c01100] transition-all duration-200 shadow-lg shadow-brand-red/30 hover:shadow-brand-red/40 hover:-translate-y-0.5 text-sm sm:text-base"
            >
              Contact Our Team
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
