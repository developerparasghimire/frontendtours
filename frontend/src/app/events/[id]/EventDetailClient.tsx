"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import MotionWrapper from "@/components/shared/MotionWrapper";
import ReviewSection from "@/components/shared/ReviewSection";
import type { Event } from "@/types";
import { shouldUseUnoptimizedImage } from "@/lib/images";
import { sanitizeHTML } from "@/lib/sanitize";
import { useCurrency } from "@/context/CurrencyContext";
import { useTranslation } from "@/context/TranslationContext";
import { tr } from "@/lib/langContent";
import { eventPdfLead } from "@/lib/api";
import { generateEventPDF } from "@/lib/generateDetailPDF";

function PDFDownloadModal({ onDownload, onClose }: { onDownload: (email: string) => Promise<void>; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@") || !trimmed.split("@")[1]?.includes(".")) {
      setError(t("pdf.email_error"));
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await onDownload(trimmed);
      onClose();
    } catch {
      setError(t("pdf.server_error"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[110] bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onClose} className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 text-2xl leading-none" aria-label="Close">×</button>
        <div className="text-center mb-5">
          <div className="w-12 h-12 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-brand-navy">{t("pdf.download_event")}</h3>
          <p className="text-gray-500 text-sm mt-1">{t("pdf.subtitle_event")}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-brand-navy mb-1">{t("pdf.email_label")}</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("pdf.email_placeholder")}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 text-brand-navy" required autoFocus />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
          <button type="submit" disabled={submitting} className="w-full bg-brand-blue text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60">
            {submitting ? t("pdf.generating") : t("pdf.download_btn")}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function EventDetailClient({ event }: { event: Event & { longDescription?: string; highlights?: string[]; availableTickets?: number; totalTickets?: number; numericId?: number } }) {
  const soldOut = event.availableTickets === 0;
  const { formatPrice } = useCurrency();
  const { t, lang } = useTranslation();
  const displayPrice = event.basePrice ? formatPrice(event.basePrice) : event.price;

  const tTitle = tr(event, lang, "title") || event.title;
  const tCategory = tr(event, lang, "category") || event.category;
  const tVenue = tr(event, lang, "venue") || event.location;
  const tDescription = tr(event, lang, "long_description") || event.longDescription || tr(event, lang, "description") || event.description;
  const tHighlightsRaw = lang !== "EN" ? tr(event, lang, "highlights") : "";
  const tHighlights = tHighlightsRaw ? tHighlightsRaw.split("\n").filter(Boolean) : (event.highlights || []);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const bookingCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bookingCardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex flex-col pb-20 lg:pb-0">
      {/* ═══════════ HERO with Brand Colors ═══════════ */}
      <section className="relative min-h-[380px] sm:min-h-[440px] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0b1820] via-[#0f2230] to-[#0a1820]" />
        {event.image && (
          <Image
            src={event.image}
            alt=""
            fill
            priority
            className="object-cover object-center"
            unoptimized={shouldUseUnoptimizedImage(event.image)}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/70 via-brand-navy/60 to-brand-navy/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/56 via-transparent to-brand-navy/22" />
        <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="absolute -top-[15%] right-[8%] w-[400px] h-[400px] rounded-full bg-brand-blue/22 blur-[140px] pointer-events-none" />
        <div className="absolute -bottom-[12%] left-[5%] w-[340px] h-[340px] rounded-full bg-brand-green/12 blur-[120px] pointer-events-none" />
        <div className="absolute top-[40%] left-[50%] w-[250px] h-[250px] rounded-full bg-brand-blue/8 blur-[100px] pointer-events-none" />
        <div className="absolute top-0 right-[30%] w-px h-[200%] bg-gradient-to-b from-transparent via-white/[0.04] to-transparent -rotate-[30deg] origin-top pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-brand-blue via-brand-green to-brand-blue" />

        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-16 pt-20">
          <span className="inline-block bg-brand-orange/90 backdrop-blur-sm text-white text-xs font-bold px-4 py-1.5 rounded-full mb-4 shadow-lg uppercase tracking-wide">
            {tCategory}
          </span>
          <h1 className="text-2xl sm:text-4xl md:text-6xl font-extrabold text-white mb-4">
            {tTitle}
          </h1>
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-gray-200 text-sm sm:text-base">
            {tVenue && (
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {tVenue}
              </span>
            )}
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {event.date}
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {event.time}
            </span>
          </div>
        </div>
      </section>

      {/* ═══════════ CONTENT ═══════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Description */}
            <MotionWrapper>
              <h2 className="text-xl sm:text-2xl font-bold text-brand-navy mb-4">{t("event.about")}</h2>
              {tDescription && /<[a-z][\s\S]*>/i.test(tDescription) ? (
                <div
                  className="text-gray-700 leading-relaxed text-base sm:text-lg [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:text-brand-navy [&>h1]:mb-3 [&>h2]:text-xl [&>h2]:font-bold [&>h2]:text-brand-navy [&>h2]:mb-2 [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:text-brand-navy [&>h3]:mb-2 [&>p]:mb-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-3 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-3 [&>blockquote]:border-l-4 [&>blockquote]:border-brand-navy/30 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-gray-600 [&>blockquote]:mb-3 [&>img]:max-w-full [&>img]:rounded-xl [&>img]:my-4"
                  dangerouslySetInnerHTML={{ __html: sanitizeHTML(tDescription) }}
                />
              ) : (
                <p className="text-gray-700 leading-relaxed text-base sm:text-lg">
                  {tDescription}
                </p>
              )}
            </MotionWrapper>

            {/* Highlights */}
            {tHighlights.length > 0 && (
              <MotionWrapper delay={0.1}>
                <h2 className="text-xl sm:text-2xl font-bold text-brand-navy mb-4">{t("event.highlights")}</h2>
                <div className="space-y-3">
                  {tHighlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-brand-blue/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-700 text-base">{h}</span>
                    </div>
                  ))}
                </div>
              </MotionWrapper>
            )}

            {/* FAQ Accordion */}
            {event.faqs && event.faqs.length > 0 && (
              <MotionWrapper delay={0.15}>
                <h2 className="text-xl sm:text-2xl font-bold text-brand-navy mb-4">{t("tour.faq")}</h2>
                <div className="space-y-3">
                  {event.faqs.map((faq, i) => (
                    <div key={faq.id} className="border border-gray-100 rounded-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left bg-white hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-semibold text-brand-navy text-sm sm:text-base">{tr(faq, lang, "question") || faq.question}</span>
                        <svg
                          className={`w-5 h-5 text-brand-navy flex-shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {openFaq === i && (
                        <div className="px-5 pb-4 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-3 bg-gray-50">
                          {tr(faq, lang, "answer") || faq.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </MotionWrapper>
            )}

            {/* Info Grid */}
            <MotionWrapper delay={0.2}>
              <div className="bg-[#eef2f7] rounded-2xl p-5 sm:p-6 grid grid-cols-2 gap-x-6 gap-y-5">
                <div className="flex items-start gap-3">
                  <span className="w-9 h-9 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  </span>
                  <div>
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">{t("event.date")}</p>
                    <p className="text-brand-navy font-semibold text-sm mt-0.5">{event.date}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-9 h-9 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </span>
                  <div>
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">{t("event.time")}</p>
                    <p className="text-brand-navy font-semibold text-sm mt-0.5">{event.time}</p>
                  </div>
                </div>
                {tVenue && (
                  <div className="flex items-start gap-3">
                    <span className="w-9 h-9 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                      <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                    </span>
                    <div>
                      <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">{t("event.venue")}</p>
                      <p className="text-brand-navy font-semibold text-sm mt-0.5">{tVenue}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <span className="w-9 h-9 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                  </span>
                  <div>
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">{t("event.category")}</p>
                    <p className="text-brand-navy font-semibold text-sm mt-0.5">{tCategory}</p>
                  </div>
                </div>
              </div>
            </MotionWrapper>
          </div>

          {/* Sidebar Booking Card */}
          <div className="lg:col-span-1">
            <div ref={bookingCardRef} className="sticky top-20 sm:top-24 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="relative h-40 sm:h-48">
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 420px"
                  unoptimized={shouldUseUnoptimizedImage(event.image)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
              <div className="p-5 sm:p-6 space-y-5">
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wider">{t("event.price")}</p>
                  <p className="text-2xl sm:text-4xl font-extrabold text-brand-green">{displayPrice}</p>
                  <p className="text-gray-500 text-sm">{t("event.per_ticket")}</p>
                </div>

                {event.totalTickets !== undefined && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-700">
                      <span>{t("event.availability")}</span>
                      <span className={`font-semibold ${soldOut ? "text-red-500" : "text-brand-green"}`}>
                        {soldOut ? t("common.sold_out") : `${event.availableTickets} / ${event.totalTickets} left`}
                      </span>
                    </div>
                    {!soldOut && event.totalTickets > 0 && (
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-brand-green h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(5, ((event.availableTickets ?? 0) / event.totalTickets) * 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {soldOut ? (
                  <button disabled className="w-full bg-gray-200 text-gray-400 font-bold py-4 rounded-xl text-lg cursor-not-allowed">
                    {t("common.sold_out")}
                  </button>
                ) : (
                  <Link href={`/booking?type=event&id=${event.id}`}>
                    <button className="w-full bg-brand-red text-white font-bold py-4 rounded-xl text-lg hover:bg-red-700 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer active:scale-[0.98]">
                      {t("event.book")}
                    </button>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => setPdfModalOpen(true)}
                  className="flex items-center justify-center gap-2 w-full border-2 border-brand-navy text-brand-navy font-bold py-3 rounded-xl hover:bg-brand-navy hover:text-white transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {t("event.download")}
                </button>

                <div className="pt-2 border-t border-gray-100 text-center">
                  <p className="text-gray-500 text-xs">{t("common.need_help")}</p>
                  <Link href="/contact" className="font-bold text-brand-navy hover:text-brand-orange transition-colors">
                    {t("common.contact")}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ REVIEWS ═══════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 w-full">
        <MotionWrapper delay={0.3}>
          <ReviewSection eventId={event.numericId} />
        </MotionWrapper>
      </section>

      {/* ═══════════ STICKY BOOK BAR ═══════════ */}
      {!soldOut && (
        <div className={`fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-3 shadow-2xl transition-transform duration-300 ${showStickyBar ? "translate-y-0" : "translate-y-full"}`}>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 leading-none">{t("event.price")}</p>
            <p className="text-lg font-extrabold text-brand-green leading-tight">{displayPrice}</p>
          </div>
          <Link
            href={`/booking?type=event&id=${event.id}`}
            className="flex-shrink-0 bg-brand-red text-white font-bold px-5 py-3 rounded-xl hover:bg-red-700 transition-colors active:scale-95 text-sm mr-16"
          >
            {t("event.book")}
          </Link>
        </div>
      )}

      {/* ═══════════ PDF MODAL ═══════════ */}
      {pdfModalOpen && (
        <PDFDownloadModal
          onClose={() => setPdfModalOpen(false)}
          onDownload={async (email) => {
            if (event.numericId) await eventPdfLead(email, event.numericId);
            await generateEventPDF(event);
          }}
        />
      )}

      {/* ═══════════ BACK LINK ═══════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full">
        <MotionWrapper>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-brand-blue font-semibold hover:text-brand-navy transition-colors duration-200 group"
          >
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {t("event.back")}
          </Link>
        </MotionWrapper>
      </section>
    </div>
  );
}
