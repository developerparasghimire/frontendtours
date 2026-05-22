"use client";

import Image from "next/image";
import Link from "next/link";
import MotionWrapper from "@/components/shared/MotionWrapper";
import ReviewSection from "@/components/shared/ReviewSection";
import type { Event } from "@/types";
import { shouldUseUnoptimizedImage } from "@/lib/images";
import { sanitizeHTML } from "@/lib/sanitize";

export default function EventDetailClient({ event }: { event: Event & { longDescription?: string; highlights?: string[]; availableTickets?: number; totalTickets?: number; numericId?: number } }) {
  const soldOut = event.availableTickets === 0;

  return (
    <div className="flex flex-col">
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
            {event.category}
          </span>
          <h1 className="text-2xl sm:text-4xl md:text-6xl font-extrabold text-white mb-4">
            {event.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-gray-200 text-sm sm:text-base">
            {event.location && (
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {event.location}
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
              <h2 className="text-xl sm:text-2xl font-bold text-brand-navy mb-4">About This Event</h2>
              {(event.longDescription || event.description) && /<[a-z][\s\S]*>/i.test(event.longDescription || event.description || "") ? (
                <div
                  className="text-gray-700 leading-relaxed text-base sm:text-lg [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:text-brand-navy [&>h1]:mb-3 [&>h2]:text-xl [&>h2]:font-bold [&>h2]:text-brand-navy [&>h2]:mb-2 [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:text-brand-navy [&>h3]:mb-2 [&>p]:mb-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-3 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-3 [&>blockquote]:border-l-4 [&>blockquote]:border-brand-navy/30 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-gray-600 [&>blockquote]:mb-3 [&>img]:max-w-full [&>img]:rounded-xl [&>img]:my-4"
                  dangerouslySetInnerHTML={{ __html: sanitizeHTML(event.longDescription || event.description || "") }}
                />
              ) : (
                <p className="text-gray-700 leading-relaxed text-base sm:text-lg">
                  {event.longDescription || event.description}
                </p>
              )}
            </MotionWrapper>

            {/* Highlights */}
            {event.highlights && event.highlights.length > 0 && (
              <MotionWrapper delay={0.1}>
                <h2 className="text-xl sm:text-2xl font-bold text-brand-navy mb-4">Event Highlights</h2>
                <div className="space-y-3">
                  {event.highlights.map((h, i) => (
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
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Date</p>
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
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Time</p>
                    <p className="text-brand-navy font-semibold text-sm mt-0.5">{event.time}</p>
                  </div>
                </div>
                {event.location && (
                  <div className="flex items-start gap-3">
                    <span className="w-9 h-9 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                      <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                    </span>
                    <div>
                      <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Venue</p>
                      <p className="text-brand-navy font-semibold text-sm mt-0.5">{event.location}</p>
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
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Category</p>
                    <p className="text-brand-navy font-semibold text-sm mt-0.5">{event.category}</p>
                  </div>
                </div>
              </div>
            </MotionWrapper>
          </div>

          {/* Sidebar Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 sm:top-24 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
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
                  <p className="text-sm text-gray-500 uppercase tracking-wider">Entry Price</p>
                  <p className="text-2xl sm:text-4xl font-extrabold text-brand-green">{event.price}</p>
                  <p className="text-gray-500 text-sm">per ticket</p>
                </div>

                {event.totalTickets !== undefined && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-700">
                      <span>Availability</span>
                      <span className={`font-semibold ${soldOut ? "text-red-500" : "text-brand-green"}`}>
                        {soldOut ? "Sold Out" : `${event.availableTickets} / ${event.totalTickets} left`}
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
                    Sold Out
                  </button>
                ) : (
                  <Link href={`/booking?type=event&id=${event.id}`}>
                    <button className="w-full bg-brand-red text-white font-bold py-4 rounded-xl text-lg hover:bg-red-700 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer active:scale-[0.98]">
                      Book Tickets
                    </button>
                  </Link>
                )}

                <div className="pt-2 border-t border-gray-100 text-center">
                  <p className="text-gray-500 text-xs">Need help with your booking?</p>
                  <Link href="/contact" className="font-bold text-brand-navy hover:text-brand-orange transition-colors">
                    Contact Us
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
            Back to All Events
          </Link>
        </MotionWrapper>
      </section>
    </div>
  );
}
