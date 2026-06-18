"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import PageHero from "@/components/sections/PageHero";
import { sectionImages } from "@/lib/sectionImages";
import { usePageBanner } from "@/hooks/usePageBanner";
import { useTranslation } from "@/context/TranslationContext";

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
  const { t } = useTranslation();

  const faqs = [
    {
      categoryKey: "faq.cat1",
      items: [
        { qKey: "faq.q1_1", aKey: "faq.a1_1" },
        { qKey: "faq.q1_2", aKey: "faq.a1_2" },
        { qKey: "faq.q1_3", aKey: "faq.a1_3" },
        { qKey: "faq.q1_4", aKey: "faq.a1_4" },
        { qKey: "faq.q1_5", aKey: "faq.a1_5" },
      ],
    },
    {
      categoryKey: "faq.cat2",
      items: [
        { qKey: "faq.q2_1", aKey: "faq.a2_1" },
        { qKey: "faq.q2_2", aKey: "faq.a2_2" },
        { qKey: "faq.q2_3", aKey: "faq.a2_3" },
        { qKey: "faq.q2_4", aKey: "faq.a2_4" },
        { qKey: "faq.q2_5", aKey: "faq.a2_5" },
      ],
    },
    {
      categoryKey: "faq.cat3",
      items: [
        { qKey: "faq.q3_1", aKey: "faq.a3_1" },
        { qKey: "faq.q3_2", aKey: "faq.a3_2" },
        { qKey: "faq.q3_3", aKey: "faq.a3_3" },
        { qKey: "faq.q3_4", aKey: "faq.a3_4" },
        { qKey: "faq.q3_5", aKey: "faq.a3_5" },
      ],
    },
    {
      categoryKey: "faq.cat4",
      items: [
        { qKey: "faq.q4_1", aKey: "faq.a4_1" },
        { qKey: "faq.q4_2", aKey: "faq.a4_2" },
        { qKey: "faq.q4_3", aKey: "faq.a4_3" },
        { qKey: "faq.q4_4", aKey: "faq.a4_4" },
        { qKey: "faq.q4_5", aKey: "faq.a4_5" },
      ],
    },
    {
      categoryKey: "faq.cat5",
      items: [
        { qKey: "faq.q5_1", aKey: "faq.a5_1" },
        { qKey: "faq.q5_2", aKey: "faq.a5_2" },
        { qKey: "faq.q5_3", aKey: "faq.a5_3" },
      ],
    },
    {
      categoryKey: "faq.cat6",
      items: [
        { qKey: "faq.q6_1", aKey: "faq.a6_1" },
        { qKey: "faq.q6_2", aKey: "faq.a6_2" },
        { qKey: "faq.q6_3", aKey: "faq.a6_3" },
        { qKey: "faq.q6_4", aKey: "faq.a6_4" },
        { qKey: "faq.q6_5", aKey: "faq.a6_5" },
        { qKey: "faq.q6_6", aKey: "faq.a6_6" },
        { qKey: "faq.q6_7", aKey: "faq.a6_7" },
      ],
    },
  ];

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
            <div key={section.categoryKey} className="mb-12">

              {/* Category header */}
              <div className="flex items-center gap-3 mb-5">
                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-xl text-xs font-black border ${meta.color}`}>
                  {si + 1}
                </span>
                <h2 className="text-lg sm:text-xl font-black text-brand-navy tracking-tight">{t(section.categoryKey)}</h2>
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
                          {t(item.qKey)}
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
                              <p className="text-slate-500 text-sm sm:text-[0.9rem] leading-relaxed">{t(item.aKey)}</p>
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
              <span className="w-4 h-px bg-brand-orange" />{t("faq.still_help")}<span className="w-4 h-px bg-brand-orange" />
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-3 tracking-tight">{t("faq.cant_find")}</h3>
            <p className="text-white/50 text-sm sm:text-base mb-8 max-w-sm mx-auto leading-relaxed">
              Our team is ready to help. Send us a message and we&apos;ll reply within 24 hours.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2.5 bg-brand-red text-white font-bold px-8 py-3.5 rounded-2xl hover:bg-[#c01100] transition-all duration-200 shadow-lg shadow-brand-red/30 hover:shadow-brand-red/40 hover:-translate-y-0.5 text-sm sm:text-base"
            >
              {t("faq.contact_btn")}
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
