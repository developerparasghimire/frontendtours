"use client";

import Image from "next/image";
import Link from "next/link";
import MotionWrapper, { StaggerContainer, StaggerItem } from "@/components/shared/MotionWrapper";
import type { Tour } from "@/types";
import ReviewSection from "@/components/shared/ReviewSection";
import { shouldUseUnoptimizedImage } from "@/lib/images";
import { sanitizeHTML } from "@/lib/sanitize";

export default function TourDetailClient({ tour }: { tour: Tour }) {
  return (
    <div className="flex flex-col">
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
          {tour.badge && (
            <span
              className="inline-block bg-brand-orange text-white text-xs font-bold px-4 py-1.5 rounded-full mb-4 shadow-lg"
            >
              {tour.badge}
            </span>
          )}
          <h1
            className="text-2xl sm:text-4xl md:text-6xl font-extrabold text-white mb-4"
          >
            {tour.title}
          </h1>
          <div
            className="flex flex-wrap items-center gap-3 sm:gap-6 text-gray-200 text-sm sm:text-base"
          >
            {tour.location && (
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {tour.location}
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
                {tour.rating} Rating
              </span>
            )}
            {tour.difficulty && (
              <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold">
                {tour.difficulty}
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
              <h2 className="text-xl sm:text-2xl font-bold text-brand-navy mb-4">About This Tour</h2>
              {tour.longDescription && /<[a-z][\s\S]*>/i.test(tour.longDescription) ? (
                <div
                  className="text-gray-700 leading-relaxed text-base sm:text-lg [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:text-brand-navy [&>h1]:mb-3 [&>h2]:text-xl [&>h2]:font-bold [&>h2]:text-brand-navy [&>h2]:mb-2 [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:text-brand-navy [&>h3]:mb-2 [&>p]:mb-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-3 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-3 [&>blockquote]:border-l-4 [&>blockquote]:border-brand-navy/30 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-gray-600 [&>blockquote]:mb-3 [&>img]:max-w-full [&>img]:rounded-xl [&>img]:my-4"
                  dangerouslySetInnerHTML={{ __html: sanitizeHTML(tour.longDescription) }}
                />
              ) : (
                <p className="text-gray-700 leading-relaxed text-base sm:text-lg">
                  {tour.longDescription || tour.description}
                </p>
              )}
            </MotionWrapper>

            {/* Highlights */}
            <MotionWrapper delay={0.1}>
              <h2 className="text-xl sm:text-2xl font-bold text-brand-navy mb-4">Tour Highlights</h2>
              <div className="space-y-3">
                {tour.highlights?.map((h, i) => (
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
              <h2 className="text-xl sm:text-2xl font-bold text-brand-navy mb-4">Gallery</h2>
              <StaggerContainer className="grid grid-cols-2 gap-4" staggerDelay={0.1}>
                {tour.gallery?.map((src, i) => (
                  <StaggerItem key={i}>
                    <div
                      className="relative aspect-video rounded-2xl overflow-hidden group"
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
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </MotionWrapper>
          </div>

          {/* Sidebar Booking Card */}
          <div className="lg:col-span-1">
            <div
              className="sticky top-20 sm:top-24 bg-white rounded-2xl shadow-xl border border-gray-100 p-5 sm:p-8 space-y-5 sm:space-y-6"
            >
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wider">Starting from</p>
                <p className="text-2xl sm:text-4xl font-extrabold text-brand-green">{tour.price}</p>
                <p className="text-gray-500 text-sm">per person</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-brand-navy mb-1 block">Select Date</label>
                  <input
                    type="date"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 text-brand-navy"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-brand-navy mb-1 block">Travelers</label>
                  <select className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 text-brand-navy bg-white">
                    <option>1 Person</option>
                    <option>2 People</option>
                    <option>3-5 People</option>
                    <option>6+ People</option>
                  </select>
                </div>
              </div>

              <Link
                href={`/booking?type=tour&id=${tour.id}`}
                className="block w-full bg-brand-red text-white font-bold py-4 rounded-xl text-lg text-center hover:bg-red-700 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.98] mb-3"
              >
                Book This Tour
              </Link>

              {/* Includes */}
              <div className="border-t-2 border-gray-100 pt-4">
                <p className="font-bold text-brand-navy text-sm mb-3 uppercase tracking-wider">What&apos;s Included</p>
                <ul className="space-y-2">
                  {tour.includes?.map((item, i) => (
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
                <p className="text-gray-500 text-xs">Need help planning your trip?</p>
                <Link href="/contact" className="font-bold text-brand-navy hover:text-brand-orange transition-colors">
                  Contact Us
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
            Back to All Tours
          </Link>
        </div>
      </section>
    </div>
  );
}
