"use client";

import { useMemo, useState } from "react";
import MotionWrapper from "@/components/shared/MotionWrapper";
import TourCard from "@/components/shared/TourCard";
import type { Tour } from "@/types";
import type { APICategory } from "@/lib/api";
import PageHero from "@/components/sections/PageHero";
import { sectionImages } from "@/lib/sectionImages";

const tourCardOffsets = ["xl:translate-y-2", "xl:-translate-y-2", "xl:translate-y-3", "xl:-translate-y-1"] as const;
const ALL = "All";

export default function ToursClient({
  tours,
  adminCategories = [],
}: {
  tours: Tour[];
  adminCategories?: APICategory[];
}) {
  // Top-level categories defined by admin (active only).
  const categories = useMemo(() => {
    const names = adminCategories
      .filter((c) => c.parent === null && c.is_active)
      .sort((a, b) => (a.order - b.order) || a.name.localeCompare(b.name))
      .map((c) => c.name);
    return [ALL, ...names];
  }, [adminCategories]);

  // Set of admin category names (lowercased) used to filter out tours whose
  // category is not (or no longer) in the admin-managed list.
  const adminCategoryNames = useMemo(
    () =>
      new Set(
        adminCategories
          .filter((c) => c.parent === null && c.is_active)
          .map((c) => c.name.trim().toLowerCase()),
      ),
    [adminCategories],
  );

  // Only show tours whose category matches an admin-managed category. If no
  // admin categories have been configured yet, fall back to showing everything.
  const visibleTours = useMemo(() => {
    if (adminCategoryNames.size === 0) return tours;
    return tours.filter((t) =>
      adminCategoryNames.has((t.category || "").trim().toLowerCase()),
    );
  }, [tours, adminCategoryNames]);

  const [selectedCategory, setSelectedCategory] = useState<string>(ALL);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(ALL);

  // Sub-categories defined by admin under the currently selected parent.
  const subcategories = useMemo(() => {
    if (selectedCategory === ALL) return [] as string[];
    const parent = adminCategories.find(
      (c) =>
        c.parent === null &&
        c.is_active &&
        c.name.toLowerCase() === selectedCategory.toLowerCase(),
    );
    if (!parent) return [];
    const subs = adminCategories
      .filter((c) => c.parent === parent.id && c.is_active)
      .sort((a, b) => (a.order - b.order) || a.name.localeCompare(b.name))
      .map((c) => c.name);
    if (subs.length === 0) return [];
    return [ALL, ...subs];
  }, [adminCategories, selectedCategory]);

  function handleCategoryChange(cat: string) {
    setSelectedCategory(cat);
    setSelectedSubcategory(ALL);
  }

  const filteredTours = useMemo(() => {
    let list = visibleTours;
    if (selectedCategory !== ALL) {
      list = list.filter(
        (t) => (t.category || "").trim().toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    if (selectedSubcategory !== ALL) {
      list = list.filter(
        (t) => (t.subcategory || "").trim().toLowerCase() === selectedSubcategory.toLowerCase()
      );
    }
    return list;
  }, [visibleTours, selectedCategory, selectedSubcategory]);

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

      {/* ═══════════ CATEGORY FILTER + RESULTS COUNT ═══════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-10 pb-0 sm:pb-0 w-full">
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
                    onClick={() => handleCategoryChange(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors duration-200 ${
                      active
                        ? "bg-brand-orange text-white border-brand-orange"
                        : "bg-white text-brand-navy border-gray-200 hover:border-brand-orange hover:text-brand-orange"
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
              <label htmlFor="tour-category" className="sr-only">
                Filter tours by category
              </label>
              <select
                id="tour-category"
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-brand-navy focus:border-brand-orange focus:outline-none"
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

        {/* Sub-category filter (e.g. Trekking regions) */}
        {subcategories.length > 1 && (
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              {selectedCategory} regions
            </p>
            <div className="hidden sm:flex flex-wrap gap-2">
              {subcategories.map((sub) => {
                const active = selectedSubcategory === sub;
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setSelectedSubcategory(sub)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors duration-200 ${
                      active
                        ? "bg-brand-navy text-white border-brand-navy"
                        : "bg-white text-brand-navy border-gray-200 hover:border-brand-navy"
                    }`}
                    aria-pressed={active}
                  >
                    {sub}
                  </button>
                );
              })}
            </div>
            <div className="sm:hidden">
              <label htmlFor="tour-subcategory" className="sr-only">
                Filter by {selectedCategory} region
              </label>
              <select
                id="tour-subcategory"
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-brand-navy focus:border-brand-navy focus:outline-none"
              >
                {subcategories.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub === ALL ? `All ${selectedCategory.toLowerCase()} regions` : sub}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

      </div>

      {/* ═══════════ TOURS GRID ═══════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24 pt-4 sm:pt-6 w-full">
        <p className="text-gray-500 text-sm mb-5">
          Showing <span className="font-bold text-brand-navy">{filteredTours.length}</span> tour{filteredTours.length !== 1 ? "s" : ""}
          {selectedCategory !== ALL && (
            <>
              {" "}in <span className="font-bold text-brand-navy">{selectedCategory}</span>
            </>
          )}
          {selectedSubcategory !== ALL && (
            <>
              {" — "}<span className="font-bold text-brand-navy">{selectedSubcategory}</span>
            </>
          )}
        </p>
        {filteredTours.length > 0 ? (
          <div className={`grid gap-5 ${
            filteredTours.length === 1
              ? "grid-cols-1 max-w-sm mx-auto"
              : filteredTours.length === 2
              ? "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto sm:gap-6"
              : filteredTours.length === 3
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 max-w-5xl mx-auto"
              : "grid-cols-1 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 xl:gap-8"
          }`}>
            {filteredTours.map((tour, index) => (
              <div key={tour.id} className={filteredTours.length >= 4 ? `${tourCardOffsets[index % tourCardOffsets.length]} transition-opacity duration-300` : "transition-opacity duration-300"}>
                <TourCard {...tour} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 text-6xl mb-4">🏔️</p>
            {selectedCategory !== ALL && tours.length > 0 ? (
              <>
                <p className="text-gray-500 text-lg mb-4">
                  No tours found in{" "}
                  <span className="font-semibold text-brand-navy">{selectedCategory}</span>
                  {selectedSubcategory !== ALL && (
                    <>
                      {" "}—{" "}
                      <span className="font-semibold text-brand-navy">{selectedSubcategory}</span>
                    </>
                  )}
                  .
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory(ALL);
                    setSelectedSubcategory(ALL);
                  }}
                  className="inline-flex items-center gap-2 bg-brand-orange text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-orange-600 transition-colors duration-200"
                >
                  Show all tours
                </button>
              </>
            ) : (
              <p className="text-gray-500 text-lg">No tours available right now. Check back soon!</p>
            )}
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
