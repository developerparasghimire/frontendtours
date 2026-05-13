"use client";

import MotionWrapper from "@/components/shared/MotionWrapper";
import EventCard from "@/components/shared/EventCard";
import type { Event } from "@/types";
import PageHero from "@/components/sections/PageHero";
import ZoomSection from "@/components/ui/ZoomSection";
import { sectionImages } from "@/lib/sectionImages";

const eventCardOffsets = ["xl:translate-y-6", "xl:-translate-y-8", "xl:translate-y-10", "xl:-translate-y-4"] as const;

export default function EventsClient({ events }: { events: Event[] }) {
  return (
    <div className="flex flex-col overflow-x-hidden">
      {/* ═══════════ HERO ═══════════ */}
      <PageHero
        title="Upcoming Events & Experiences"
        subtitle="Don't Miss Out"
        description="Discover concerts, cultural walks, festivals, cooking classes, and more happening across Nepal."
        accentColor="brand-blue"
        backgroundImage={sectionImages.eventsHost}
        compact
      />

      {/* ═══════════ EVENT GRID ═══════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full">
        <div className="mb-8">
          <p className="text-gray-500 text-sm">
            Showing <span className="font-bold text-brand-navy">{events.length}</span> event{events.length !== 1 ? "s" : ""}
          </p>
        </div>

        {events.length > 0 ? (
          <ZoomSection>
            <div className={`grid gap-5 ${
              events.length === 1
                ? "grid-cols-1 max-w-sm mx-auto"
                : events.length === 2
                ? "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto sm:gap-6"
                : events.length === 3
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 max-w-5xl mx-auto"
                : "grid-cols-1 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 xl:gap-8"
            }`}>
              {events.map((event, index) => (
                <div key={event.id} className={events.length >= 4 ? `${eventCardOffsets[index % eventCardOffsets.length]} transition-opacity duration-300` : "transition-opacity duration-300"}>
                  <EventCard {...event} />
                </div>
              ))}
            </div>
          </ZoomSection>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 text-6xl mb-4">🎭</p>
            <p className="text-gray-500 text-lg">
              No events available right now. Check back soon!
            </p>
          </div>
        )}
      </section>

      {/* ═══════════ PARALLAX BAND ═══════════ */}
      <section
        className="parallax-bg relative py-20 sm:py-28 overflow-hidden"
        style={{
          backgroundImage:
            `url('${sectionImages.eventsHost}')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/70 via-brand-navy/60 to-brand-navy/70" />
        <MotionWrapper variant="scale-up" className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
            Want to Host an Event With Us?
          </h2>
          <p className="text-gray-300 text-base sm:text-lg mb-6 sm:mb-8 max-w-xl mx-auto">
            Partner with Get Tours to promote your event to thousands of travelers and locals.
          </p>
          <a
            href="/contact"
            className="group inline-flex items-center gap-2 bg-brand-red text-white font-semibold px-8 py-3.5 rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            Contact Us
            <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </MotionWrapper>
      </section>

      {/* ═══════════ NEWSLETTER ═══════════ */}
     
    </div>
  );
}
