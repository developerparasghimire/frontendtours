"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Tour, Event } from "@/types";
import TourCard from "@/components/shared/TourCard";
import EventCard from "@/components/shared/EventCard";

export default function SearchClient({
  query,
  tours,
  events,
}: {
  query: string;
  tours: Tour[];
  events: Event[];
}) {
  const router = useRouter();
  const [input, setInput] = useState(query);

  const total = tours.length + events.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Bar */}
      <div className="bg-brand-navy px-4 py-10 sm:py-14">
        <div className="mx-auto max-w-2xl">
          <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.28em] text-white/50">
            Search Results
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const trimmed = input.trim();
              const params = new URLSearchParams();
              if (trimmed) params.set("q", trimmed);
              router.push(`/search${params.toString() ? `?${params.toString()}` : ""}`);
            }}
            className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 shadow-lg"
          >
            <svg className="h-4 w-4 flex-shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Search tours, events, destinations..."
              className="flex-1 border-none bg-transparent text-sm font-medium text-brand-navy outline-none placeholder:text-slate-400"
              autoFocus
            />
            <button
              type="submit"
              className="flex-shrink-0 rounded-full bg-brand-red px-5 py-1.5 text-sm font-semibold text-white transition-all hover:bg-[#c11000]"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {query ? (
          <p className="mb-8 text-sm text-gray-500">
            {total === 0 ? "No results" : `${total} result${total !== 1 ? "s" : ""}`} for{" "}
            <span className="font-bold text-brand-navy">&ldquo;{query}&rdquo;</span>
          </p>
        ) : (
          <p className="mb-8 text-sm text-gray-500">Enter a keyword above to search tours and events.</p>
        )}

        {/* Tours */}
        {tours.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-5 text-lg font-bold text-brand-navy">
              Tours <span className="ml-1 text-sm font-normal text-gray-400">({tours.length})</span>
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {tours.map((tour) => (
                <TourCard key={tour.id} {...tour} />
              ))}
            </div>
          </section>
        )}

        {/* Events */}
        {events.length > 0 && (
          <section>
            <h2 className="mb-5 text-lg font-bold text-brand-navy">
              Events <span className="ml-1 text-sm font-normal text-gray-400">({events.length})</span>
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {events.map((event) => (
                <EventCard key={event.id} {...event} />
              ))}
            </div>
          </section>
        )}

        {query && total === 0 && (
          <div className="py-20 text-center">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-lg font-semibold text-brand-navy">No results found</p>
            <p className="mt-2 text-sm text-gray-500">Try a different keyword or browse all tours and events.</p>
          </div>
        )}
      </div>
    </div>
  );
}
