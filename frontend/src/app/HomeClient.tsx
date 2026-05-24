"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import HeroSlider from "@/components/HeroSlider";
import MotionWrapper, { StaggerContainer, StaggerItem } from "@/components/shared/MotionWrapper";
import SubscribeForm from "@/components/shared/SubscribeForm";
import ZoomSection from "@/components/ui/ZoomSection";
import TourImagePlaceholder from "@/components/shared/TourImagePlaceholder";
import type { Tour, Event, Testimonial } from "@/types";
import type { SiteConfig, APIPartner, APICategory } from "@/lib/api";
import { shouldUseUnoptimizedImage } from "@/lib/images";
import { sectionImages } from "@/lib/sectionImages";

const categories = [
  { icon: "🏔️", label: "Trekking", count: 12 },
  { icon: "🛕", label: "Cultural", count: 8 },
  { icon: "🦏", label: "Wildlife", count: 5 },
  { icon: "🪂", label: "Adventure", count: 10 },
  { icon: "🧘", label: "Spiritual", count: 4 },
  { icon: "📸", label: "Photography", count: 6 },
];
function getEventDateParts(dateLabel: string) {
  const parsed = new Date(dateLabel);

  if (Number.isNaN(parsed.getTime())) {
    return {
      month: dateLabel,
      day: "",
    };
  }

  return {
    month: parsed.toLocaleString("en-US", { month: "short" }),
    day: parsed.toLocaleString("en-US", { day: "2-digit" }),
  };
}

function LatestEventFeatureCard({ event, index, noStagger }: { event: Event; index: number; noStagger?: boolean }) {
  const dateParts = getEventDateParts(event.date);
  const staggerClasses = [
    "xl:translate-y-4",
    "xl:-translate-y-6",
    "xl:translate-y-8",
    "xl:-translate-y-3",
  ];

  return (
    <div className={noStagger ? "" : (staggerClasses[index % staggerClasses.length] || "")}>
      <Link href={`/events/${event.id}`} className="group block">
        <div className="relative overflow-hidden rounded-xl bg-[#171717]">
          <div className="relative aspect-[4/3.8] sm:aspect-[4/4.2] lg:aspect-[4/4.6]">
            <Image
              src={event.image}
              alt={event.title}
              fill
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              loading="lazy"
              quality={72}
              unoptimized={shouldUseUnoptimizedImage(event.image)}
            />
            <div className="absolute inset-0 bg-black/20 transition-opacity duration-500 group-hover:bg-black/10" />
            <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-black via-black/80 to-transparent transition-all duration-500 group-hover:h-[78%]" />

            <div className="absolute left-5 top-5 right-5 flex items-start justify-between gap-3">
              <span className="rounded-full border border-white/15 bg-black/25 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.28em] text-white/70 backdrop-blur-sm">
                {event.category}
              </span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/80 backdrop-blur-sm">
                {event.price}
              </span>
            </div>

            <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 text-center transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-[calc(50%+12px)]">
              <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-white/55 sm:text-[11px]">
                {dateParts.month}
              </p>
              <div className="mt-2 text-3xl font-semibold leading-none tracking-[-0.06em] text-white sm:text-4xl lg:text-5xl">
                {dateParts.day}
              </div>
              <h3 className="mx-auto mt-3 max-w-[12rem] text-base font-semibold leading-tight text-white sm:text-lg lg:text-xl">
                {event.title}
              </h3>
            </div>

            <div className="absolute inset-x-6 bottom-5 flex items-end justify-between gap-4 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:bottom-8">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-white/45">
                  {event.location || "Nepal"}
                </p>
                <p className="mt-1 text-sm text-white/75">{event.time}</p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/90 sm:text-[11px]">
                View event
                <svg className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M4 12h16" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

/* ─── Latest Events Showcase ─── */
function LatestEventsSlider({ events }: { events: Event[] }) {
  const featuredEvents = events.slice(0, 3);
  const [mobileEventIdx, setMobileEventIdx] = useState(0);
  const evTouchX = useRef(0);

  // Infinite auto-advance on mobile
  useEffect(() => {
    if (featuredEvents.length < 2) return;
    const t = setInterval(() => setMobileEventIdx((i) => (i + 1) % featuredEvents.length), 3500);
    return () => clearInterval(t);
  }, [featuredEvents.length]);

  return (
    <section className="dark-section relative overflow-hidden py-20 sm:py-24">
      <Image
        src="/img/sand-1.png"
        alt=""
        width={373}
        height={219}
        loading="lazy"
        quality={60}
        className="pointer-events-none absolute left-1/2 top-[46%] hidden w-[300px] -translate-x-[112%] -translate-y-[72%] opacity-55 xl:block"
      />
      <Image
        src="/img/sand-2.png"
        alt=""
        width={373}
        height={219}
        loading="lazy"
        quality={60}
        className="pointer-events-none absolute left-1/2 top-[51%] hidden w-[290px] translate-x-[18%] translate-y-[8%] opacity-55 xl:block"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <MotionWrapper className="text-center mb-10 sm:mb-14">
          <p className="font-mono text-[11px] tracking-[0.34em] text-brand-orange uppercase">What&apos;s Happening</p>
          <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[-0.05em] text-white">
            Latest Events
          </h2>
          <p className="mt-4 text-sm sm:text-base max-w-2xl mx-auto text-white/60">
            Upcoming festivals, cultural experiences, and local happenings across Nepal.
          </p>
        </MotionWrapper>

        {/* Mobile: single-card slider */}
        <div className="sm:hidden">
          <div
            className="overflow-hidden rounded-xl"
            onTouchStart={(e) => { evTouchX.current = e.touches[0].clientX; }}
            onTouchEnd={(e) => {
              const dx = evTouchX.current - e.changedTouches[0].clientX;
              if (dx > 40) setMobileEventIdx((i) => (i + 1) % featuredEvents.length);
              if (dx < -40) setMobileEventIdx((i) => (i - 1 + featuredEvents.length) % featuredEvents.length);
            }}
          >
            <div
              className="flex transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ transform: `translateX(-${mobileEventIdx * 100}%)` }}
            >
              {featuredEvents.map((event, index) => (
                <div key={event.id} className="w-full flex-shrink-0 px-0.5">
                  <LatestEventFeatureCard event={event} index={index} />
                </div>
              ))}
            </div>
          </div>
          {/* Dots only — hidden when just one card */}
          {featuredEvents.length > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              {featuredEvents.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setMobileEventIdx(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === mobileEventIdx ? "w-6 bg-white" : "w-2 bg-white/30"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Desktop: flex+justify-center keeps each card at its natural 1/3-width regardless of count */}
        <div className="hidden sm:flex flex-wrap justify-center gap-5 lg:gap-6">
          {featuredEvents.map((event, index) => (
            <div key={event.id} className="w-[calc(50%-10px)] lg:w-[calc(33.333%-16px)]">
              <LatestEventFeatureCard event={event} index={index} noStagger={featuredEvents.length < 3} />
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 rounded-full bg-brand-red px-8 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#c11000] shadow-[0_8px_24px_-8px_rgba(226,19,1,0.4)]"
          >
            View all events
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

function getTourDurationParts(durationLabel?: string) {
  if (!durationLabel) {
    return { value: "", label: "Journey" };
  }

  const match = durationLabel.match(/(\d+)\s*(.*)/);
  if (!match) {
    return { value: durationLabel, label: "Journey" };
  }

  return {
    value: match[1],
    label: match[2] || "Days",
  };
}

function FeaturedTourCard({
  tour,
  index,
  noStagger,
}: {
  tour: Tour;
  index: number;
  noStagger?: boolean;
}) {
  const durationParts = getTourDurationParts(tour.duration);
  const staggerClasses = [
    "xl:translate-y-4",
    "xl:-translate-y-6",
    "xl:translate-y-8",
    "xl:-translate-y-3",
  ];

  return (
    <div className={noStagger ? "" : (staggerClasses[index % staggerClasses.length] || "")}>
      <Link href={`/tours/${tour.id}`} className="group block">
        <div className="relative overflow-hidden rounded-xl bg-[#171717]">
          <div className="relative aspect-[4/3.8] sm:aspect-[4/4.2] lg:aspect-[4/4.6]">
            {tour.image ? (
              <Image
                src={tour.image}
                alt={tour.title}
                fill
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                loading="lazy"
                quality={72}
                unoptimized={shouldUseUnoptimizedImage(tour.image)}
              />
            ) : (
              <TourImagePlaceholder title={tour.title} />
            )}
            <div className="absolute inset-0 bg-black/20 transition-opacity duration-500 group-hover:bg-black/10" />
            <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-black via-black/80 to-transparent transition-all duration-500 group-hover:h-[78%]" />

            <div className="absolute left-5 top-5 right-5 flex items-start justify-between gap-3">
              <span className="rounded-full border border-white/15 bg-black/25 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.28em] text-white/70 backdrop-blur-sm">
                {tour.badge || tour.category || "Journey"}
              </span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/80 backdrop-blur-sm">
                {tour.price}
              </span>
            </div>

            <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 text-center transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-[calc(50%+12px)]">
              <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-white/55 sm:text-[11px]">
                {durationParts.label}
              </p>
              <div className="mt-2 text-3xl font-semibold leading-none tracking-[-0.06em] text-white sm:text-4xl lg:text-5xl">
                {durationParts.value}
              </div>
              <h3 className="mx-auto mt-3 max-w-[12rem] text-base font-semibold leading-tight text-white sm:text-lg lg:text-xl">
                {tour.title}
              </h3>
            </div>

            <div className="absolute inset-x-6 bottom-5 flex items-end justify-between gap-4 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:bottom-8">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-white/45">
                  {tour.location || "Nepal"}
                </p>
                <p className="mt-1 text-sm text-white/75">{tour.difficulty || "Moderate"}</p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/90 sm:text-[11px]">
                Explore tour
                <svg className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M4 12h16" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

/* ─── Tours Slider ─── */
function ToursSlider({
  tours,
}: {
  tours: Tour[];
}) {
  const featuredTours = tours.slice(0, 3);
  const [mobileTourIdx, setMobileTourIdx] = useState(0);
  const tourTouchX = useRef(0);

  // Infinite auto-advance on mobile
  useEffect(() => {
    if (featuredTours.length < 2) return;
    const t = setInterval(() => setMobileTourIdx((i) => (i + 1) % featuredTours.length), 3500);
    return () => clearInterval(t);
  }, [featuredTours.length]);

  return (
    <section className="dark-section relative overflow-hidden py-20 sm:py-24">
      <Image
        src="/img/sand-1.png"
        alt=""
        width={373}
        height={219}
        loading="lazy"
        quality={60}
        className="pointer-events-none absolute left-1/2 top-[44%] hidden w-[300px] -translate-x-[110%] -translate-y-[70%] opacity-55 xl:block"
      />
      <Image
        src="/img/sand-2.png"
        alt=""
        width={373}
        height={219}
        loading="lazy"
        quality={60}
        className="pointer-events-none absolute left-1/2 top-[53%] hidden w-[290px] translate-x-[16%] translate-y-[10%] opacity-55 xl:block"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <MotionWrapper className="text-center mb-10 sm:mb-14">
          <p className="font-mono text-[11px] tracking-[0.34em] text-brand-orange uppercase">Top Picks</p>
          <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[-0.05em] text-white">
            Popular Tour Packages
          </h2>
          <p className="mt-4 text-sm sm:text-base max-w-2xl mx-auto text-white/60">
            Our most booked adventures across Nepal — handpicked for every type of traveller.
          </p>
        </MotionWrapper>

        {/* Mobile: single-card slider */}
        <div className="sm:hidden">
          <div
            className="overflow-hidden rounded-xl"
            onTouchStart={(e) => { tourTouchX.current = e.touches[0].clientX; }}
            onTouchEnd={(e) => {
              const dx = tourTouchX.current - e.changedTouches[0].clientX;
              if (dx > 40) setMobileTourIdx((i) => (i + 1) % featuredTours.length);
              if (dx < -40) setMobileTourIdx((i) => (i - 1 + featuredTours.length) % featuredTours.length);
            }}
          >
            <div
              className="flex transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ transform: `translateX(-${mobileTourIdx * 100}%)` }}
            >
              {featuredTours.map((tour, index) => (
                <div key={tour.id} className="w-full flex-shrink-0 px-0.5">
                  <FeaturedTourCard
                    tour={tour}
                    index={index}
                  />
                </div>
              ))}
            </div>
          </div>
          {/* Dots only — hidden when just one card */}
          {featuredTours.length > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              {featuredTours.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setMobileTourIdx(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === mobileTourIdx ? "w-6 bg-white" : "w-2 bg-white/30"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Desktop: flex+justify-center keeps each card at its natural 1/3-width regardless of count */}
        <div className="hidden sm:flex flex-wrap justify-center gap-5 lg:gap-6">
          {featuredTours.map((tour, index) => (
            <div key={tour.id} className="w-[calc(50%-10px)] lg:w-[calc(33.333%-16px)]">
              <FeaturedTourCard
                tour={tour}
                index={index}
                noStagger={featuredTours.length < 3}
              />
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/tours"
            className="inline-flex items-center gap-2 rounded-full bg-brand-red px-8 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#c11000] shadow-[0_8px_24px_-8px_rgba(226,19,1,0.4)]"
          >
            See all tours
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

function HomePortfolioShowcase({ siteConfig }: { siteConfig?: SiteConfig | null }) {
  const portfolioLinkLabel = siteConfig?.home_portfolio_link_label || "View portfolio";
  const portfolioLinkUrl = siteConfig?.home_portfolio_link_url || "/tours";
  const portfolioImages = [
    siteConfig?.home_portfolio_image_1,
    siteConfig?.home_portfolio_image_2,
    siteConfig?.home_portfolio_image_3,
    siteConfig?.home_portfolio_image_4,
    siteConfig?.home_portfolio_image_5,
  ].filter((image): image is string => Boolean(image));

  if (portfolioImages.length === 0) return null;

  const desktopLayouts = [
    "left-[6%] top-[18%] w-[240px] -rotate-[6deg] aspect-[4/5]",
    "left-1/2 top-[4%] w-[305px] -translate-x-1/2 rotate-[9deg] aspect-[5/3.4]",
    "left-[14%] top-[58%] w-[305px] -rotate-[11deg] aspect-[5/3.4]",
    "right-[14%] top-[14%] w-[240px] rotate-[6deg] aspect-[4/5]",
    "right-[8%] top-[54%] w-[265px] rotate-[11deg] aspect-[4/5]",
  ];

  return (
    <section className="dark-section relative overflow-hidden px-4 py-24 sm:px-6 sm:py-28 lg:px-8">
      <Image
        src="/img/sand-1.png"
        alt=""
        width={373}
        height={219}
        loading="lazy"
        quality={60}
        className="pointer-events-none absolute left-1/2 top-1/2 hidden w-[320px] -translate-x-[132%] -translate-y-[75%] opacity-60 xl:block"
      />
      <Image
        src="/img/sand-2.png"
        alt=""
        width={373}
        height={219}
        loading="lazy"
        quality={60}
        className="pointer-events-none absolute left-1/2 top-1/2 hidden w-[320px] translate-x-[10%] translate-y-[8%] opacity-60 xl:block"
      />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="hidden xl:block">
          <div className="relative mx-auto h-[720px] max-w-[1100px]">
            {portfolioImages.map((image, index) => (
              <Link
                key={`${image}-${index}`}
                href={portfolioLinkUrl}
                className={`group absolute block overflow-hidden bg-[#171717] transition-transform duration-300 hover:z-20 hover:scale-[1.03] ${desktopLayouts[index] || desktopLayouts[desktopLayouts.length - 1]}`}
              >
                <Image
                  src={image}
                  alt={`Portfolio image ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(min-width: 1280px) 320px, 100vw"
                  loading="lazy"
                  quality={72}
                  unoptimized={shouldUseUnoptimizedImage(image)}
                />
                <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/45" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <svg className="h-9 w-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2 12s3.75-6 10-6 10 6 10 6-3.75 6-10 6S2 12 2 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:hidden">
          {portfolioImages.map((image, index) => (
            <Link key={`${image}-mobile-${index}`} href={portfolioLinkUrl} className="group block overflow-hidden bg-[#171717]">
              <div className="relative aspect-[4/5]">
                <Image
                  src={image}
                  alt={`Portfolio image ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 50vw"
                  loading="lazy"
                  quality={72}
                  unoptimized={shouldUseUnoptimizedImage(image)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center relative z-20">
          <Link
            href={portfolioLinkUrl}
            className="inline-flex items-center gap-2 rounded-full bg-brand-red px-8 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#c11000] shadow-[0_8px_24px_-8px_rgba(226,19,1,0.4)]"
          >
            {portfolioLinkLabel}
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials Slider ─── */
function TestimonialsSlider({ testimonials }: { testimonials: Testimonial[] }) {
  const [idx, setIdx] = useState(0);
  const total = testimonials.length;
  const testTouchX = useRef(0);

  const prev = useCallback(() => setIdx((i) => (i === 0 ? total - 1 : i - 1)), [total]);
  const next = useCallback(() => setIdx((i) => (i + 1) % total), [total]);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  if (total === 0) return null;

  const t = testimonials[idx];

  return (
    <section className="dark-section relative overflow-hidden py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header */}
        <MotionWrapper className="text-center mb-12">
          <p className="font-mono text-[11px] tracking-[0.34em] text-brand-orange uppercase">Testimonials</p>
          <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[-0.05em] text-white">
            Real stories from Nepal travelers
          </h2>
        </MotionWrapper>

        {/* Single-centered Slider */}
        <div
          className="relative min-h-[380px] flex items-center justify-center"
          onTouchStart={(e) => { testTouchX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            const dx = testTouchX.current - e.changedTouches[0].clientX;
            if (dx > 40) next();
            if (dx < -40) prev();
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const }}
              className="w-full max-w-3xl"
            >
              <div className="relative dark-panel rounded-[2rem] p-10 sm:p-14 flex flex-col items-center text-center">
                <div className="absolute -top-6 bg-brand-red w-12 h-12 rounded-full flex items-center justify-center shadow-lg shadow-brand-red/30 text-white">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                <div className="flex items-center gap-1.5 mb-6">
                  {[...Array(t.rating || 5)].map((_, si) => (
                    <svg key={si} className="w-5 h-5 text-[#f59e0b]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-white/85 text-lg sm:text-2xl font-medium leading-relaxed mb-8 flex-grow">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex flex-col items-center gap-3">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden ring-4 ring-white/10">
                    <Image
                      src={t.image || "/img/landscape_background_small.jpg"}
                      alt={t.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                      loading="lazy"
                      quality={70}
                      unoptimized={shouldUseUnoptimizedImage(t.image)}
                    />
                  </div>
                  <div>
                    <p className="font-bold text-white text-base">{t.name}</p>
                    <p className="text-xs text-white/45 uppercase tracking-widest mt-1">{t.location}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation dots */}
        <div className="mt-10 flex items-center justify-center gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === idx ? "w-8 bg-brand-red" : "w-2 bg-white/20 hover:bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface HomeClientProps {
  tours: Tour[];
  events: Event[];
  testimonials: Testimonial[];
  siteConfig?: SiteConfig | null;
  partners?: APIPartner[];
  featuredCategories?: APICategory[];
}

/* ─── Certificates & Partners Section ─── */
function CertificatesPartnersSection({ partners }: { partners: APIPartner[] }) {
  if (partners.length === 0) return null;

  return (
    <section className="bg-white py-14 sm:py-20 border-t border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <MotionWrapper className="text-center mb-10 sm:mb-14">
          <p className="font-mono text-[11px] tracking-[0.34em] text-brand-red uppercase">Trusted By</p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-brand-navy">
            Certificates &amp; Partners
          </h2>
          <div className="mt-4 flex items-center justify-center gap-3">
            <span className="h-px w-16 bg-slate-200" />
            <span className="inline-block h-2.5 w-2.5 rounded-full border-2 border-brand-red" />
            <span className="h-px w-16 bg-slate-200" />
          </div>
        </MotionWrapper>

        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 lg:gap-16">
          {partners.map((partner) => {
            const content = (
              <div className="group flex flex-col items-center gap-3 transition-opacity duration-300 hover:opacity-80">
                <div className="relative h-16 w-28 sm:h-20 sm:w-32 flex items-center justify-center">
                  {partner.logo ? (
                    <Image
                      src={partner.logo}
                      alt={partner.name}
                      fill
                      className="object-contain transition-opacity duration-300"
                      sizes="128px"
                      loading="lazy"
                      quality={80}
                      unoptimized={shouldUseUnoptimizedImage(partner.logo)}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-400">
                      {partner.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <span className="text-xs font-semibold text-slate-500 text-center leading-tight max-w-[7rem] group-hover:text-brand-navy transition-colors duration-300">
                  {partner.name}
                </span>
              </div>
            );

            return partner.website_url ? (
              <a
                key={partner.id}
                href={partner.website_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {content}
              </a>
            ) : (
              <div key={partner.id}>{content}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function HomeClient({ tours, events, testimonials, siteConfig, partners = [], featuredCategories = [] }: HomeClientProps) {
  const trustReasons = [
    {
      icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
      title: "Verified & Safe",
      description: "Every tour is vetted for safety. Licensed guides, insured vehicles, and 24/7 support throughout your journey.",
      stat: "200+ licensed guides",
      iconBgClass: "bg-brand-green/16",
      iconTextClass: "text-brand-green",
      accentClass: "bg-brand-green",
      cardGlowClass: "hover:shadow-[0_30px_70px_-38px_rgba(47,142,7,0.45)]",
    },
    {
      icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
      title: "Best Price Guarantee",
      description: "We match any comparable offer. Get the best value for your Nepal adventure with no hidden fees.",
      stat: "500+ trips matched",
      iconBgClass: "bg-brand-orange/16",
      iconTextClass: "text-brand-orange",
      accentClass: "bg-brand-orange",
      cardGlowClass: "hover:shadow-[0_30px_70px_-38px_rgba(238,135,33,0.45)]",
    },
    {
      icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
      title: "Local Expertise",
      description: "Our team of local experts crafts authentic experiences. We know Nepal like the back of our hand.",
      stat: "15 yrs local roots",
      iconBgClass: "bg-brand-red/16",
      iconTextClass: "text-brand-red",
      accentClass: "bg-brand-red",
      cardGlowClass: "hover:shadow-[0_30px_70px_-38px_rgba(226,19,1,0.45)]",
    },
  ];

  return (
    <div className="flex flex-col overflow-x-hidden">
      <HeroSlider siteConfig={siteConfig} />

      {/* ═══════════ ABOUT US ═══════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50/60 to-white py-14 sm:py-20 lg:py-32">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-brand-green/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-brand-navy/5 blur-3xl" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-slate-100/40 rounded-l-[5rem] hidden lg:block" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* ── Mobile-first flex-col, desktop grid ── */}
          <div className="flex flex-col gap-8 lg:grid lg:grid-cols-2 lg:gap-24 lg:items-center">

            {/* ── [Mobile order 1] Label + Heading + Description ── */}
            <div className="flex flex-col gap-4 lg:hidden">
              <div className="inline-flex items-center gap-2 self-start bg-brand-orange/10 text-brand-orange rounded-full px-4 py-2">
                <span className="text-[11px] font-bold tracking-[0.2em] uppercase">About Us</span>
              </div>
              <h2 className="text-3xl font-extrabold text-brand-navy leading-[1.1] tracking-tight">
                Your Himalayan
                <span className="text-brand-red"> Adventure</span> Awaits
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                {siteConfig?.site_description ||
                  "Founded in Thamel, Kathmandu in 2018, Get Tours Nepal is the Himalayas\u2019 most trusted trekking agency \u2014 crafting authentic mountain experiences for adventurers around the globe."}
              </p>
            </div>

            {/* ── [Mobile order 2 / Desktop left] Image composition ── */}
            <MotionWrapper variant="fade-right" className="relative">
              {/* Main image */}
              <div className="relative h-72 sm:h-[420px] lg:h-[520px] rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src={sectionImages.homeAbout}
                  alt="Himalayan trekking adventure"
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  loading="lazy"
                  quality={72}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                {/* Bottom caption */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <span className="rounded-full bg-white/15 backdrop-blur-md border border-white/20 px-3 py-1 text-white text-[11px] font-semibold tracking-wide">
                    Himalayan Expeditions
                  </span>
                  <span className="rounded-full bg-brand-red text-white px-3 py-1 text-[11px] font-bold">
                    25+ Years
                  </span>
                </div>
              </div>

              {/* Overlapping secondary image */}
              <div className="absolute -bottom-8 -right-3 sm:-right-8 w-32 h-28 sm:w-52 sm:h-44 lg:w-60 lg:h-52 rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                <Image
                  src={sectionImages.homeAboutInset}
                  alt="Kathmandu culture"
                  fill
                  className="object-cover"
                  sizes="300px"
                  loading="lazy"
                  quality={70}
                />
              </div>

              {/* Experience badge — top left */}
              <div className="absolute -top-4 -left-3 sm:-top-6 sm:-left-6 bg-brand-red text-white rounded-2xl px-4 py-4 sm:px-5 sm:py-5 shadow-2xl text-center z-10">
                <p className="text-3xl sm:text-4xl font-extrabold leading-none">25+</p>
                <p className="text-[10px] sm:text-[11px] font-bold mt-1 opacity-90 tracking-wider uppercase">Years Expert</p>
              </div>

            </MotionWrapper>

            {/* ── [Mobile order 3 / Desktop right] Full text content ── */}
            <MotionWrapper variant="fade-left" className="flex flex-col gap-6 lg:gap-7 mt-6 lg:mt-0">
              {/* Label + heading + desc — desktop only (shown above image on mobile) */}
              <div className="hidden lg:flex flex-col gap-5">
                <div className="inline-flex items-center gap-2 self-start bg-brand-orange/10 text-brand-orange rounded-full px-4 py-2">
                  <span className="text-[11px] font-bold tracking-[0.2em] uppercase">About Us</span>
                </div>
                <h2 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-brand-navy leading-[1.07] tracking-tight">
                  Your Himalayan<br />
                  <span className="text-brand-red"> Adventure</span> Awaits
                </h2>
                <p className="text-slate-500 text-base sm:text-lg leading-relaxed max-w-xl">
                  {siteConfig?.site_description ||
                    "Founded in Thamel, Kathmandu in 2018, Get Tours Nepal is the Himalayas\u2019 most trusted trekking agency \u2014 crafting authentic mountain experiences for adventurers from around the globe."}
                </p>
              </div>

              {/* Feature bullets */}
              <div className="flex flex-col gap-3 lg:gap-4">
                {[
                  { title: "Expert Sherpa Guides", desc: "Certified guides with 10\u201325 years of Himalayan expertise ensure your safety and enrich every step." },
                  { title: "Safety First Approach", desc: "Full acclimatisation support, emergency protocols, and 24/7 assistance on every trek." },
                  { title: "Responsible Tourism", desc: "Leave-No-Trace practices, fair wages for local staff, and community reinvestment programs." },
                ].map((f) => (
                  <div key={f.title} className="group bg-white rounded-2xl p-3.5 lg:p-0 lg:bg-transparent border border-slate-100 lg:border-0 shadow-sm lg:shadow-none">
                    <div className="pt-0.5">
                      <h4 className="font-bold text-brand-navy text-sm">{f.title}</h4>
                      <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mt-0.5">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats — mobile: horizontal scrollable pill row; desktop: 3-col grid */}
              <div className="grid grid-cols-3 gap-2 lg:gap-4 border-t border-gray-100 pt-5">
                {[
                  { value: "10K+", label: "Happy Trekkers" },
                  { value: "150+", label: "Verified Routes" },
                  { value: "98%", label: "Satisfaction" },
                ].map((s) => (
                  <div key={s.label} className="text-center bg-slate-50 lg:bg-transparent rounded-2xl py-3 lg:py-0">
                    <p className="text-2xl lg:text-3xl font-extrabold text-brand-navy">{s.value}</p>
                    <p className="text-[11px] lg:text-xs text-slate-400 mt-1 font-medium">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* CTAs — full width on mobile */}
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-red px-8 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#c11000] shadow-[0_8px_24px_-8px_rgba(226,19,1,0.4)]"
                >
                  Our Story
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-brand-navy/20 text-brand-navy px-8 py-3.5 text-sm font-semibold hover:border-brand-navy hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                  Get in Touch
                </Link>
              </div>
            </MotionWrapper>

          </div>
        </div>
      </section>

      <LatestEventsSlider events={events} />

      {/* ═══════════ TRAVEL CATEGORIES ═══════════ */}
      <section className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MotionWrapper className="text-center mb-10">
            <p className="font-mono text-[11px] tracking-[0.34em] text-brand-orange uppercase">Travel Styles</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-navy mt-2">
              Find Your Adventure
            </h2>
          </MotionWrapper>

          <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4" staggerDelay={0.08}>
            {(featuredCategories && featuredCategories.length > 0 ? featuredCategories : []).map((cat) => (
              <StaggerItem key={cat.id}>
                <Link
                  href={`/${cat.kind === "event" ? "events" : "tours"}?category=${encodeURIComponent(cat.name)}`}
                  className="block text-center p-7 rounded-2xl bg-white/90 backdrop-blur-xl hover:bg-white hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.1)] transition-all duration-500 cursor-pointer border border-gray-100/60 group hover:-translate-y-2 hover:border-brand-blue/20"
                >
                  {cat.image ? (
                    <span className="relative block w-14 h-14 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                      <Image
                        src={cat.image}
                        alt={cat.name}
                        fill
                        className="object-contain"
                        sizes="56px"
                        unoptimized={shouldUseUnoptimizedImage(cat.image)}
                      />
                    </span>
                  ) : (
                    <span className="text-4xl block mb-3 group-hover:scale-125 transition-transform duration-300">{cat.icon || "✨"}</span>
                  )}
                  <h3 className="font-bold text-brand-navy text-sm mb-1 group-hover:text-brand-blue transition-colors duration-300">{cat.name}</h3>
                  {cat.description ? (
                    <p className="text-gray-400 text-xs line-clamp-2">{cat.description}</p>
                  ) : null}
                </Link>
              </StaggerItem>
            ))}
            {(!featuredCategories || featuredCategories.length === 0) && categories.map((cat) => (
              <StaggerItem key={cat.label}>
                <div
                  className="text-center p-7 rounded-2xl bg-white/90 backdrop-blur-xl hover:bg-white hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.1)] transition-all duration-500 cursor-pointer border border-gray-100/60 group hover:-translate-y-2 hover:border-brand-blue/20"
                >
                  <span className="text-4xl block mb-3 group-hover:scale-125 transition-transform duration-300">{cat.icon}</span>
                  <h3 className="font-bold text-brand-navy text-sm mb-1 group-hover:text-brand-blue transition-colors duration-300">{cat.label}</h3>
                  <p className="text-gray-400 text-xs">{cat.count} trips</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <ToursSlider
        tours={tours}
      />
      <HomePortfolioShowcase siteConfig={siteConfig} />

      {/* ═══════════ WHY CHOOSE US ═══════════ */}
      <section className="bg-white py-[4.5rem] sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <MotionWrapper className="mx-auto mb-10 max-w-3xl text-center sm:mb-14">
            <p className="font-mono text-[11px] tracking-[0.34em] text-brand-orange uppercase">Why Get Tours</p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-brand-navy sm:text-4xl md:text-5xl">
              Travel With Confidence
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-500 sm:text-base">
              We combine local knowledge, transparent planning, and thoughtful service so your Nepal trip feels exciting from the first click to the final day.
            </p>
          </MotionWrapper>

          <ZoomSection>
            <StaggerContainer className="grid grid-cols-1 gap-6 md:grid-cols-3 sm:gap-8" staggerDelay={0.12}>
              {trustReasons.map((item) => (
                <StaggerItem key={item.title}>
                  <div className={`group relative h-full rounded-3xl border border-slate-100 bg-white px-8 pt-8 pb-6 shadow-[0_8px_40px_-12px_rgba(15,23,42,0.10)] transition-all duration-500 hover:-translate-y-2 ${item.cardGlowClass}`}>
                    {/* Icon + stat row */}
                    <div className="flex items-center justify-between mb-7">
                      <div className={`flex h-16 w-16 items-center justify-center rounded-full transition-all duration-300 group-hover:scale-105 ${item.iconBgClass}`}>
                        <svg className={`h-8 w-8 ${item.iconTextClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                        </svg>
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-[0.15em] px-3 py-1.5 rounded-full ${item.iconBgClass} ${item.iconTextClass}`}>
                        {item.stat}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-brand-navy">{item.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-500">{item.description}</p>
                    {/* Human footer: guide avatars */}
                   
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </ZoomSection>
        </div>
      </section>

      <TestimonialsSlider testimonials={testimonials} />

      {/* ═══════════ CONTACT INFO STRIP ═══════════ */}
      <section className="bg-white py-[4.5rem] sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <MotionWrapper className="text-center mb-12">
            <p className="font-mono text-[11px] tracking-[0.34em] text-brand-orange uppercase">Get In Touch</p>
            <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold tracking-[-0.03em] text-brand-navy">
              Plan Your Nepal Journey
            </h2>
            <p className="mt-4 text-slate-500 text-sm sm:text-base max-w-xl mx-auto">
              Share your dates, travel style, or group size and our local team will shape the perfect itinerary for you.
            </p>
          </MotionWrapper>

          <div className="grid gap-5 sm:grid-cols-3">
            <MotionWrapper>
              <a
                href={`tel:${siteConfig?.phone || "+977-9812*****"}`}
                className="group flex flex-col items-center text-center rounded-3xl border border-slate-100 bg-white p-8 shadow-[0_16px_50px_-24px_rgba(15,23,42,0.12)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_24px_60px_-24px_rgba(214,28,29,0.22)] hover:border-brand-red/20"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-red/10 text-brand-red mb-5 group-hover:scale-110 transition-transform duration-300">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400 mb-2">Call Us</p>
                <p className="text-lg font-bold text-brand-navy">{siteConfig?.phone || "+977-9812*****"}</p>
                <p className="mt-1 text-sm text-slate-500">Mon–Sat, 9 AM – 6 PM</p>
              </a>
            </MotionWrapper>

            <MotionWrapper delay={0.1}>
              <a
                href={`mailto:${siteConfig?.email || "info@gettours.com.np"}`}
                className="group flex flex-col items-center text-center rounded-3xl border border-slate-100 bg-white p-8 shadow-[0_16px_50px_-24px_rgba(15,23,42,0.12)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_24px_60px_-24px_rgba(46,159,178,0.22)] hover:border-brand-blue/20"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue mb-5 group-hover:scale-110 transition-transform duration-300">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400 mb-2">Email Us</p>
                <p className="text-lg font-bold text-brand-navy">{siteConfig?.email || "info@gettours.com.np"}</p>
                <p className="mt-1 text-sm text-slate-500">Reply within 24 hours</p>
              </a>
            </MotionWrapper>

            <MotionWrapper delay={0.2}>
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center text-center rounded-3xl border border-slate-100 bg-white p-8 shadow-[0_16px_50px_-24px_rgba(15,23,42,0.12)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_24px_60px_-24px_rgba(47,142,7,0.22)] hover:border-brand-green/20"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-green/10 text-brand-green mb-5 group-hover:scale-110 transition-transform duration-300">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400 mb-2">Find Us</p>
                <p className="text-lg font-bold text-brand-navy">{siteConfig?.address || "Thamel, Kathmandu"}</p>
                <p className="mt-1 text-sm text-slate-500">Open in Google Maps</p>
              </a>
            </MotionWrapper>
          </div>

          <MotionWrapper className="mt-10 text-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-brand-red px-8 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#c11000] shadow-[0_8px_24px_-8px_rgba(226,19,1,0.4)]"
            >
              Send Us a Message
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </MotionWrapper>
        </div>
      </section>

      {/* ═══════════ CERTIFICATES & PARTNERS ═══════════ */}
      <CertificatesPartnersSection partners={partners} />

      {/* ═══════════ NEWSLETTER BANNER ═══════════ */}
      <section className="bg-white pb-20 pt-6 sm:pb-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <MotionWrapper>
            <div className="relative overflow-hidden rounded-[2rem] bg-brand-navy px-6 py-14 text-center text-white shadow-[0_34px_90px_-42px_rgba(15,23,42,0.5)] sm:px-10 sm:py-20">
              <Image
                src={sectionImages.homeNewsletter}
                alt="Nepal"
                fill
                className="object-cover object-center scale-105"
                sizes="(max-width: 768px) 100vw, 896px"
                loading="lazy"
                quality={70}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/70 via-brand-navy/60 to-brand-navy/70" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/56 via-transparent to-brand-navy/22" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(226,19,1,0.22),transparent_34%),radial-gradient(circle_at_82%_18%,rgba(238,135,33,0.18),transparent_28%)]" />
              <div className="relative z-10">
                <p className="text-sm font-bold uppercase tracking-[0.28em] text-brand-orange">Newsletter</p>
                <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-extrabold tracking-[-0.04em] text-white sm:text-4xl">
                  Get Nepal Travel Inspiration
                </h2>
                <p className="mx-auto mt-5 max-w-xl text-sm text-white/82 sm:text-base leading-relaxed">
                  Subscribe for the latest tour packages, upcoming events, travel tips, and exclusive deals delivered to your inbox.
                </p>
                <div className="mt-10">
                  <SubscribeForm className="mx-auto max-w-md" />
                </div>
              </div>
            </div>
          </MotionWrapper>
        </div>
      </section>
    </div>
  );
}
