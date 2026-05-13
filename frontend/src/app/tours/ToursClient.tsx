"use client";

import MotionWrapper from "@/components/shared/MotionWrapper";
import TourCard from "@/components/shared/TourCard";
import type { Tour } from "@/types";
import PageHero from "@/components/sections/PageHero";
import ZoomSection from "@/components/ui/ZoomSection";
import { sectionImages } from "@/lib/sectionImages";

const tourCardOffsets = ["xl:translate-y-6", "xl:-translate-y-8", "xl:translate-y-10", "xl:-translate-y-4"] as const;

export default function ToursClient({ tours }: { tours: Tour[] }) {
  return (
    <div className="flex flex-col overflow-x-hidden">
      {/* ═══════════ HERO ═══════════ */}
      <PageHero
        title="All Tour Packages"
        subtitle="Explore Nepal"
        description="From day trips to multi-week treks — find the perfect adventure for every traveler."
        accentColor="brand-orange"
        backgroundImage={sectionImages.toursHelp}
        compact
      />

      {/* ═══════════ RESULTS COUNT ═══════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-2 w-full">
        <p className="text-gray-500 text-sm">
          Showing <span className="font-bold text-brand-navy">{tours.length}</span> tour{tours.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* ═══════════ TOURS GRID ═══════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24 pt-4 w-full">
        {tours.length > 0 ? (
          <ZoomSection>
            <div className={`grid gap-5 ${
              tours.length === 1
                ? "grid-cols-1 max-w-sm mx-auto"
                : tours.length === 2
                ? "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto sm:gap-6"
                : tours.length === 3
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 max-w-5xl mx-auto"
                : "grid-cols-1 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 xl:gap-8"
            }`}>
              {tours.map((tour, index) => (
                <div key={tour.id} className={tours.length >= 4 ? `${tourCardOffsets[index % tourCardOffsets.length]} transition-opacity duration-300` : "transition-opacity duration-300"}>
                  <TourCard {...tour} />
                </div>
              ))}
            </div>
          </ZoomSection>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 text-6xl mb-4">🏔️</p>
            <p className="text-gray-500 text-lg">No tours available right now. Check back soon!</p>
          </div>
        )}
      </section>

      {/* ═══════════ CTA BAND ═══════════ */}
      <section
        className="parallax-bg relative py-20 sm:py-28 overflow-hidden"
        style={{
          backgroundImage:
            `url('${sectionImages.toursHelp}')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/70 via-brand-navy/60 to-brand-navy/70" />
        <MotionWrapper variant="scale-up" className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
            Can&apos;t Decide? Let Us Help!
          </h2>
          <p className="text-gray-300 text-base sm:text-lg mb-6 sm:mb-8 max-w-xl mx-auto">
            Our travel experts will craft a personalized itinerary just for you.
          </p>
          <a
            href="/contact"
            className="group inline-flex items-center gap-2 bg-brand-red text-white font-semibold px-8 py-3.5 rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            Get Custom Trip
            <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </MotionWrapper>
      </section>

    
    </div>
  );
}
