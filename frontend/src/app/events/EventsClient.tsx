"use client";

import { useMemo, useState } from "react";
import MotionWrapper from "@/components/shared/MotionWrapper";
import EventCard from "@/components/shared/EventCard";
import type { Event } from "@/types";
import type { APICategory } from "@/lib/api";
import PageHero from "@/components/sections/PageHero";
import ZoomSection from "@/components/ui/ZoomSection";
import { sectionImages } from "@/lib/sectionImages";

const eventCardOffsets = ["xl:translate-y-6", "xl:-translate-y-8", "xl:translate-y-10", "xl:-translate-y-4"] as const;
const ALL = "All";

export default function EventsClient({
  events,
  adminCategories = [],
}: {
  events: Event[];
  adminCategories?: APICategory[];
}) {
  const categories = useMemo(() => {
    const names = adminCategories
      .filter((c) => c.parent === null && c.is_active)
      .sort((a, b) => (a.order - b.order) || a.name.localeCompare(b.name))
      .map((c) => c.name);
    return [ALL, ...names];
  }, [adminCategories]);

  const [selectedCategory, setSelectedCategory] = useState<string>(ALL);

  const filteredEvents = useMemo(() => {
    if (selectedCategory === ALL) return events;
    return events.filter(
      (e) => (e.category || "").trim().toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [events, selectedCategory]);

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
        {categories.length > 1 && (
          <div className="mb-5">
            {/* Pills for sm+ */}
            <div className="hidden sm:flex flex-wrap gap-2">
              {categories.map((cat) => {
                const active = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors duration-200 ${
                      active
                        ? "bg-brand-blue text-white border-brand-blue"
                        : "bg-white text-brand-navy border-gray-200 hover:border-brand-blue hover:text-brand-blue"
                    }`}
                    aria-pressed={active}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
            {/* Select for mobile */}
            <div className="sm:hidden">
              <label htmlFor="event-category" className="sr-only">
                Filter events by category
              </label>
              <select
                id="event-category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-brand-navy focus:border-brand-blue focus:outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === ALL ? "All categories" : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="mb-8">
          <p className="text-gray-500 text-sm">
            Showing <span className="font-bold text-brand-navy">{filteredEvents.length}</span> event{filteredEvents.length !== 1 ? "s" : ""}
            {selectedCategory !== ALL && (
              <>
                {" "}in <span className="font-bold text-brand-navy">{selectedCategory}</span>
              </>
            )}
          </p>
        </div>

        {filteredEvents.length > 0 ? (
          <ZoomSection>
            <div className={`grid gap-5 ${
              filteredEvents.length === 1
                ? "grid-cols-1 max-w-sm mx-auto"
                : filteredEvents.length === 2
                ? "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto sm:gap-6"
                : filteredEvents.length === 3
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 max-w-5xl mx-auto"
                : "grid-cols-1 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 xl:gap-8"
            }`}>
              {filteredEvents.map((event, index) => (
                <div key={event.id} className={filteredEvents.length >= 4 ? `${eventCardOffsets[index % eventCardOffsets.length]} transition-opacity duration-300` : "transition-opacity duration-300"}>
                  <EventCard {...event} />
                </div>
              ))}
            </div>
          </ZoomSection>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 text-6xl mb-4">🎭</p>
            {selectedCategory !== ALL && events.length > 0 ? (
              <>
                <p className="text-gray-500 text-lg mb-4">
                  No events found in <span className="font-semibold text-brand-navy">{selectedCategory}</span>.
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedCategory(ALL)}
                  className="inline-flex items-center gap-2 bg-brand-blue text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Show all events
                </button>
              </>
            ) : (
              <p className="text-gray-500 text-lg">
                No events available right now. Check back soon!
              </p>
            )}
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
