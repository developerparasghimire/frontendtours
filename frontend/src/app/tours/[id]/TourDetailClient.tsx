"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import MotionWrapper, { StaggerContainer, StaggerItem } from "@/components/shared/MotionWrapper";
import type { Tour } from "@/types";
import ReviewSection from "@/components/shared/ReviewSection";
import { shouldUseUnoptimizedImage } from "@/lib/images";
import { sanitizeHTML } from "@/lib/sanitize";
import { useCurrency } from "@/context/CurrencyContext";
import { useTranslation } from "@/context/TranslationContext";
import { tr } from "@/lib/langContent";
import { tourPdfLead } from "@/lib/api";
import { generateTourPDF } from "@/lib/generateDetailPDF";

function PDFDownloadModal({ onDownload, onClose }: { onDownload: (email: string) => Promise<void>; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@") || !trimmed.split("@")[1]?.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await onDownload(trimmed);
      onClose();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[110] bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onClose} className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 text-2xl leading-none" aria-label="Close">×</button>
        <div className="text-center mb-5">
          <div className="w-12 h-12 bg-brand-red/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-brand-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-brand-navy">Download Tour Details</h3>
          <p className="text-gray-500 text-sm mt-1">Enter your email to download the full tour details PDF.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-brand-navy mb-1">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-red/40 text-brand-navy" required autoFocus />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
          <button type="submit" disabled={submitting} className="w-full bg-brand-red text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-60">
            {submitting ? "Generating PDF…" : "Download PDF"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function TourDetailClient({ tour }: { tour: Tour }) {
  const gallery = tour.gallery || [];
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const bookingCardRef = useRef<HTMLDivElement>(null);
  const { formatPrice } = useCurrency();
  const { t, lang } = useTranslation();
  const displayPrice = tour.basePrice ? formatPrice(tour.basePrice) : tour.price;

  const tTitle = tr(tour, lang, "title") || tour.title;
  const tDescription = tr(tour, lang, "long_description") || tr(tour, lang, "description") || tour.longDescription || tour.description;
  const tBadge = tr(tour, lang, "badge") || tour.badge;
  const tBestSeason = tr(tour, lang, "best_season") || tour.bestSeason;
  const tDestination = tr(tour, lang, "destination") || tour.location;
  const tHighlightsRaw = lang !== "EN" ? tr(tour, lang, "highlights") : "";
  const tHighlights = tHighlightsRaw ? tHighlightsRaw.split("\n").filter(Boolean) : (tour.highlights || []);
  const tIncludesRaw = lang !== "EN" ? tr(tour, lang, "includes") : "";
  const tIncludes = tIncludesRaw ? tIncludesRaw.split("\n").filter(Boolean) : (tour.includes || []);
  const tDifficulty = tr(tour, lang, "difficulty") || tour.difficulty;
  const tCategory = tr(tour, lang, "category") || (tour.subcategory ? `${tour.category} / ${tour.subcategory}` : tour.category);

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
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const showPrev = useCallback(
    () => setLightboxIndex((i) => (i === null ? null : (i - 1 + gallery.length) % gallery.length)),
    [gallery.length],
  );
  const showNext = useCallback(
    () => setLightboxIndex((i) => (i === null ? null : (i + 1) % gallery.length)),
    [gallery.length],
  );

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowLeft") showPrev();
      else if (e.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightboxIndex, closeLightbox, showPrev, showNext]);

  return (
    <div className="flex flex-col pb-20 lg:pb-0">
      {/* ═══════════ HERO ═══════════ */}
      <section className="relative min-h-[380px] sm:min-h-[440px] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1610] via-[#1c1308] to-[#0d1a24]" />
        {tour.image && (
          <Image
            src={tour.image}
            alt=""
            fill
            priority
            className="object-cover object-center"
            unoptimized={shouldUseUnoptimizedImage(tour.image)}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/70 via-brand-navy/60 to-brand-navy/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/56 via-transparent to-brand-navy/22" />
        <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="absolute -top-[15%] right-[8%] w-[400px] h-[400px] rounded-full bg-brand-orange/20 blur-[140px] pointer-events-none" />
        <div className="absolute -bottom-[12%] left-[5%] w-[340px] h-[340px] rounded-full bg-brand-red/12 blur-[120px] pointer-events-none" />
        <div className="absolute top-[40%] left-[50%] w-[250px] h-[250px] rounded-full bg-brand-orange/8 blur-[100px] pointer-events-none" />
        <div className="absolute top-0 right-[30%] w-px h-[200%] bg-gradient-to-b from-transparent via-white/[0.04] to-transparent -rotate-[30deg] origin-top pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-brand-orange via-brand-red to-brand-orange" />

        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-16 pt-20">
          {tBadge && (
            <span
              className="inline-block bg-brand-orange text-white text-xs font-bold px-4 py-1.5 rounded-full mb-4 shadow-lg"
            >
              {tBadge}
            </span>
          )}
          <h1
            className="text-2xl sm:text-4xl md:text-6xl font-extrabold text-white mb-4"
          >
            {tTitle}
          </h1>
          <div
            className="flex flex-wrap items-center gap-3 sm:gap-6 text-gray-200 text-sm sm:text-base"
          >
            {tDestination && (
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {tDestination}
              </span>
            )}
            {tour.duration && (
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {tour.duration}
              </span>
            )}
            {tour.rating && (
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-brand-red" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {tour.rating} {t("tour.rating")}
              </span>
            )}
            {tDifficulty && (
              <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold">
                {tDifficulty}
              </span>
            )}
            {tBestSeason && (
              <span className="px-3 py-1 rounded-full bg-brand-green/30 text-white text-xs font-semibold">
                {tBestSeason}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════ CONTENT ═══════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Description */}
            <MotionWrapper>
              <h2 className="text-xl sm:text-2xl font-bold text-brand-navy mb-4">{t("tour.about")}</h2>
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

            {/* Info Grid */}
            {(tour.location || tour.duration || tour.difficulty || tour.category || tour.bestSeason || tour.rating) && (
              <MotionWrapper delay={0.05}>
                <div className="bg-[#eef2f7] rounded-2xl p-5 sm:p-6 grid grid-cols-2 gap-x-6 gap-y-5">
                  {tDestination && (
                    <div className="flex items-start gap-3">
                      <span className="w-9 h-9 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"/>
                        </svg>
                      </span>
                      <div>
                        <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">{t("tour.destination")}</p>
                        <p className="text-brand-navy font-semibold text-sm mt-0.5">{tDestination}</p>
                      </div>
                    </div>
                  )}
                  {tour.duration && (
                    <div className="flex items-start gap-3">
                      <span className="w-9 h-9 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                        </svg>
                      </span>
                      <div>
                        <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">{t("tour.duration")}</p>
                        <p className="text-brand-navy font-semibold text-sm mt-0.5">{tour.duration}</p>
                      </div>
                    </div>
                  )}
                  {tour.difficulty && (
                    <div className="flex items-start gap-3">
                      <span className="w-9 h-9 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h.01M8.5 15.5A5 5 0 0112 7a5 5 0 013.5 8.5"/>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 20a6 6 0 0012 0"/>
                        </svg>
                      </span>
                      <div>
                        <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">{t("tour.difficulty")}</p>
                        <p className="text-brand-navy font-semibold text-sm mt-0.5">{tDifficulty}</p>
                      </div>
                    </div>
                  )}
                  {tour.category && (
                    <div className="flex items-start gap-3">
                      <span className="w-9 h-9 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                        </svg>
                      </span>
                      <div>
                        <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">{t("tour.activity")}</p>
                        <p className="text-brand-navy font-semibold text-sm mt-0.5">{tCategory}</p>
                      </div>
                    </div>
                  )}
                  {tBestSeason && (
                    <div className="flex items-start gap-3">
                      <span className="w-9 h-9 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/>
                        </svg>
                      </span>
                      <div>
                        <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">{t("tour.best_season")}</p>
                        <p className="text-brand-navy font-semibold text-sm mt-0.5">{tBestSeason}</p>
                      </div>
                    </div>
                  )}
                  {tour.rating && (
                    <div className="flex items-start gap-3">
                      <span className="w-9 h-9 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                        <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                      </span>
                      <div>
                        <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">{t("tour.rating")}</p>
                        <p className="text-brand-navy font-semibold text-sm mt-0.5">{tour.rating} / 5</p>
                      </div>
                    </div>
                  )}
                </div>
              </MotionWrapper>
            )}

            {/* Guide */}
            {tour.guide && (
              <MotionWrapper delay={0.08}>
                <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                  {/* Header */}
                  <div className="bg-brand-navy px-5 py-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                    <h2 className="text-sm font-bold text-white uppercase tracking-widest">{t("tour.guide")}</h2>
                  </div>

                  <div className="bg-white p-5 sm:p-6">
                    <div className="flex items-start gap-4 sm:gap-5">
                      {/* Photo */}
                      {tour.guide.photo ? (
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden flex-shrink-0 shadow-md">
                          <Image
                            src={tour.guide.photo}
                            alt={tour.guide.name}
                            fill
                            className="object-cover"
                            sizes="96px"
                            unoptimized={shouldUseUnoptimizedImage(tour.guide.photo)}
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-brand-navy/10 flex items-center justify-center flex-shrink-0">
                          <svg className="w-10 h-10 text-brand-navy/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                          </svg>
                        </div>
                      )}

                      {/* Name + bio */}
                      <div className="flex-1 min-w-0">
                        <p className="text-base sm:text-lg font-bold text-brand-navy">{tour.guide.name}</p>
                        {tour.guide.bio && (
                          <p className="text-gray-500 text-sm leading-relaxed mt-1">{tr(tour.guide, lang, "bio") || tour.guide.bio}</p>
                        )}
                      </div>
                    </div>

                    {/* Languages */}
                    {tour.guide.languages && tour.guide.languages.length > 0 && (
                      <div className="mt-5 pt-5 border-t border-gray-100">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">{t("tour.languages")}</p>
                        <div className="flex flex-col gap-2.5">
                          {tour.guide.languages.map((lang) => (
                            <div key={lang.id} className="flex items-center justify-between gap-4">
                              <span className="text-sm font-medium text-brand-navy">{lang.language}</span>
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <svg
                                    key={star}
                                    className={`w-4 h-4 ${star <= lang.rating ? "text-yellow-400" : "text-gray-200"}`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                  </svg>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </MotionWrapper>
            )}

            {/* Highlights */}
            <MotionWrapper delay={0.1}>
              <h2 className="text-xl sm:text-2xl font-bold text-brand-navy mb-4">{t("tour.highlights")}</h2>
              <div className="space-y-3">
                {tHighlights.map((h, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3"
                  >
                    <div className="w-6 h-6 bg-brand-green/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700 text-base">{h}</span>
                  </div>
                ))}
              </div>
            </MotionWrapper>

            {/* Gallery */}
            <MotionWrapper delay={0.2}>
              <h2 className="text-xl sm:text-2xl font-bold text-brand-navy mb-4">{t("tour.gallery")}</h2>
              <StaggerContainer className="grid grid-cols-2 gap-4" staggerDelay={0.1}>
                {gallery.map((src, i) => (
                  <StaggerItem key={i}>
                    <button
                      type="button"
                      onClick={() => setLightboxIndex(i)}
                      aria-label={`Open image ${i + 1} of ${gallery.length}`}
                      className="relative aspect-video rounded-2xl overflow-hidden group block w-full cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-brand-orange"
                    >
                      <Image
                        src={src}
                        alt={`${tour.title} ${i + 1}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 420px"
                        unoptimized={shouldUseUnoptimizedImage(src)}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </button>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </MotionWrapper>

            {/* FAQ Accordion */}
            {tour.faqs && tour.faqs.length > 0 && (
              <MotionWrapper delay={0.25}>
                <h2 className="text-xl sm:text-2xl font-bold text-brand-navy mb-4">{t("tour.faq")}</h2>
                <div className="space-y-3">
                  {tour.faqs.map((faq, i) => (
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
          </div>

          {/* Sidebar Booking Card */}
          <div className="lg:col-span-1">
            <div
              ref={bookingCardRef}
              className="sticky top-20 sm:top-24 bg-white rounded-2xl shadow-xl border border-gray-100 p-5 sm:p-8 space-y-5 sm:space-y-6"
            >
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wider">{t("tour.price_from")}</p>
                <p className="text-2xl sm:text-4xl font-extrabold text-brand-green">{displayPrice}</p>
                <p className="text-gray-500 text-sm">{t("tour.per_person")}</p>
                {/* Star rating below price */}
                {tour.rating && (
                  <div className="flex items-center gap-1 mt-2">
                    {[1,2,3,4,5].map((star) => {
                      const filled = star <= Math.round(tour.rating!);
                      const half = !filled && star - 0.5 <= tour.rating!;
                      return (
                        <svg key={star} className={`w-4 h-4 ${filled || half ? "text-yellow-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                      );
                    })}
                    <span className="text-sm font-semibold text-brand-navy ml-0.5">{tour.rating}</span>
                    <span className="text-xs text-gray-400">/ 5</span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-brand-navy mb-1 block">{t("common.select_date")}</label>
                  <input
                    type="date"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 text-brand-navy"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-brand-navy mb-1 block">{t("common.travelers")}</label>
                  <select className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 text-brand-navy bg-white">
                    <option>{t("tour.person_1")}</option>
                    <option>{t("tour.people_2")}</option>
                    <option>{t("tour.people_3_5")}</option>
                    <option>{t("tour.people_6plus")}</option>
                  </select>
                </div>
              </div>

              {/* Payment method icons */}
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">{t("tour.we_accept")}</p>
                <div className="flex flex-wrap items-center gap-2">
                  {/* Visa */}
                  <svg viewBox="0 0 38 24" className="h-6 w-auto" aria-label="Visa"><rect width="38" height="24" rx="4" fill="#1A1F71"/><text x="5" y="17" fontFamily="Arial" fontWeight="bold" fontSize="13" fill="white" letterSpacing="-1">VISA</text></svg>
                  {/* Mastercard */}
                  <svg viewBox="0 0 38 24" className="h-6 w-auto" aria-label="Mastercard"><rect width="38" height="24" rx="4" fill="#252525"/><circle cx="15" cy="12" r="7" fill="#EB001B"/><circle cx="23" cy="12" r="7" fill="#F79E1B"/><path d="M19 7.5a7 7 0 000 9A7 7 0 0019 7.5z" fill="#FF5F00"/></svg>
                  {/* PayPal */}
                  <svg viewBox="0 0 38 24" className="h-6 w-auto" aria-label="PayPal"><rect width="38" height="24" rx="4" fill="#003087"/><text x="6" y="16" fontFamily="Arial" fontWeight="bold" fontSize="9" fill="#009CDE">Pay</text><text x="16" y="16" fontFamily="Arial" fontWeight="bold" fontSize="9" fill="white">Pal</text></svg>
                  {/* American Express */}
                  <svg viewBox="0 0 38 24" className="h-6 w-auto" aria-label="American Express"><rect width="38" height="24" rx="4" fill="#2E77BC"/><text x="4" y="11" fontFamily="Arial" fontWeight="bold" fontSize="6" fill="white">AMERICAN</text><text x="4" y="18" fontFamily="Arial" fontWeight="bold" fontSize="6" fill="white">EXPRESS</text></svg>
                  {/* Bank Transfer */}
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-100 text-[10px] font-bold text-gray-600">🏦 Bank</span>
                </div>
              </div>

              <Link
                href={`/booking?type=tour&id=${tour.id}`}
                className="block w-full bg-brand-red text-white font-bold py-4 rounded-xl text-lg text-center hover:bg-red-700 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.98] mb-3"
              >
                {t("tour.book")}
              </Link>

              <button
                type="button"
                onClick={() => setPdfModalOpen(true)}
                className="flex items-center justify-center gap-2 w-full border-2 border-brand-navy text-brand-navy font-bold py-3 rounded-xl hover:bg-brand-navy hover:text-white transition-all duration-200 mb-3"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {t("tour.download")}
              </button>

              {/* Trust Certifications */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: "🏆", key: "trust.certified" },
                  { icon: "🔒", key: "trust.safe" },
                  { icon: "📞", key: "trust.support" },
                  { icon: "💰", key: "trust.guarantee" },
                ].map(({ icon, key }) => (
                  <div key={key} className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-2 py-1.5">
                    <span className="text-sm">{icon}</span>
                    <span className="text-[10px] font-semibold text-gray-600 leading-tight">{t(key)}</span>
                  </div>
                ))}
              </div>

              {/* Includes */}
              <div className="border-t-2 border-gray-100 pt-4">
                <p className="font-bold text-brand-navy text-sm mb-3 uppercase tracking-wider">{t("tour.included")}</p>
                <ul className="space-y-2">
                  {tIncludes.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-700 text-sm">
                      <svg className="w-4 h-4 text-brand-green flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-gray-100 text-center">
                <p className="text-gray-500 text-xs">{t("common.need_help")}</p>
                <Link href="/contact" className="font-bold text-brand-navy hover:text-brand-orange transition-colors">
                  {t("common.contact")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ REVIEWS ═══════════ */}
      {tour.numericId && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
          <ReviewSection tourId={tour.numericId} />
        </section>
      )}

      {/* ═══════════ BACK LINK ═══════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full">
        <div
        >
          <Link
            href="/tours"
            className="inline-flex items-center gap-2 text-brand-blue font-semibold hover:text-brand-navy transition-colors group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {t("tour.back")}
          </Link>
        </div>
      </section>

      {/* ═══════════ STICKY BOOK BAR (appears when booking card scrolls out of view) ═══════════ */}
      <div className={`fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-3 shadow-2xl transition-transform duration-300 ${showStickyBar ? "translate-y-0" : "translate-y-full"}`}>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400 leading-none">{t("tour.price_from")}</p>
          <p className="text-lg font-extrabold text-brand-green leading-tight">{displayPrice}</p>
        </div>
        <Link
          href={`/booking?type=tour&id=${tour.id}`}
          className="flex-shrink-0 bg-brand-red text-white font-bold px-5 py-3 rounded-xl hover:bg-red-700 transition-colors active:scale-95 text-sm mr-16"
        >
          {t("tour.book")}
        </Link>
      </div>

      {/* ═══════════ PDF MODAL ═══════════ */}
      {pdfModalOpen && (
        <PDFDownloadModal
          onClose={() => setPdfModalOpen(false)}
          onDownload={async (email) => {
            if (tour.numericId) await tourPdfLead(email, tour.numericId);
            await generateTourPDF(tour);
          }}
        />
      )}

      {/* ═══════════ GALLERY LIGHTBOX ═══════════ */}
      {lightboxIndex !== null && gallery[lightboxIndex] && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
            aria-label="Close"
            className="absolute top-4 right-4 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-2xl"
          >
            ×
          </button>
          {gallery.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); showPrev(); }}
                aria-label="Previous image"
                className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); showNext(); }}
                aria-label="Next image"
                className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
              >
                ›
              </button>
            </>
          )}
          <div
            className="relative w-[92vw] h-[80vh] max-w-6xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={gallery[lightboxIndex]}
              alt={`${tour.title} ${lightboxIndex + 1}`}
              fill
              className="object-contain"
              sizes="92vw"
              unoptimized={shouldUseUnoptimizedImage(gallery[lightboxIndex])}
              priority
            />
          </div>
          {gallery.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 text-center text-white/80 text-sm">
              {lightboxIndex + 1} / {gallery.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
