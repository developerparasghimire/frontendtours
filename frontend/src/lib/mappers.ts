import type { Tour, Event } from "@/types";
import type { APITour, APIEvent } from "./api";

const eventFallbackImages: Record<string, string> = {
  jazz: "/img/landscape_background_small.jpg",
  holi: "/img/landscape_background_small.jpg",
  heritage: "/img/landscape_background_small.jpg",
  folk: "/img/landscape_background_small.jpg",
  food: "/img/landscape_background_small.jpg",
  cooking: "/img/landscape_background_small.jpg",
  buddha: "/img/landscape_background_small.jpg",
  music: "/img/landscape_background_small.jpg",
  festival: "/img/landscape_background_small.jpg",
};

function getEventFallbackImage(slug: string): string {
  const s = slug.toLowerCase();
  for (const [k, v] of Object.entries(eventFallbackImages)) {
    if (s.includes(k)) return v;
  }
  return "/img/landscape_background_small.jpg";
}

/** Map backend Tour → frontend Tour type */
export function mapAPITour(t: APITour): Tour {
  return {
    id: t.slug,
    numericId: t.id,
    title: t.title,
    description: t.description,
    longDescription: t.long_description || t.description,
    image: t.image || "",
    price: `$${(Number(t.base_price) || 0).toLocaleString()}`,
    duration: `${t.duration_days} Day${t.duration_days > 1 ? "s" : ""}`,
    location: t.destination,
    rating: Number(t.rating) || 4.5,
    badge: t.badge || undefined,
    bestSeason: t.best_season || undefined,
    difficulty: (t.difficulty as Tour["difficulty"]) || "Moderate",
    category: t.category || "Adventure",
    subcategory: t.subcategory || "",
    highlights: t.highlights || [],
    includes: t.includes || [],
    gallery: t.gallery || [],
    maxGroup: t.max_capacity,
    guide: t.guide ?? null,
  };
}

/** Map backend Event → frontend Event type */
export function mapAPIEvent(e: APIEvent): Event {
  const eventDate = new Date(e.event_date);
  return {
    id: e.slug,
    numericId: e.id,
    title: e.title,
    description: e.description,
    longDescription: e.long_description || e.description,
    image: e.image || getEventFallbackImage(e.slug),
    date: eventDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    time: eventDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    category: e.category || "Culture",
    price: !Number(e.base_price) ? "Free" : `$${Number(e.base_price).toLocaleString()}`,
    location: e.venue,
    highlights: e.highlights || [],
    availableTickets: e.available_tickets,
    totalTickets: e.total_tickets,
  };
}
