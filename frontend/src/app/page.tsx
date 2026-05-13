import { getTours, getEvents, getTestimonials, getSiteConfig, getPartners, type SiteConfig, type APIPartner } from "@/lib/api";
import { mapAPITour, mapAPIEvent } from "@/lib/mappers";
import type { Tour, Event, Testimonial } from "@/types";
import HomeClient from "./HomeClient";

// H11: ISR — home rebuilt at most once per 5 minutes. Tours/events/testimonials
// don't change often enough to justify rebuilding on every request.
export const revalidate = 300;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://gettours.com.np";

export default async function Home() {
  let tours: Tour[] = [];
  let events: Event[] = [];
  let testimonials: Testimonial[] = [];
  let siteConfig: SiteConfig | null = null;
  let partners: APIPartner[] = [];

  try {
    const [apiTours, apiEvents, apiTestimonials, apiConfig, apiPartners] = await Promise.all([
      getTours({ is_latest: true }).catch(() => []),
      getEvents({ is_latest: true }).catch(() => []),
      getTestimonials().catch(() => []),
      getSiteConfig().catch(() => null),
      getPartners().catch(() => []),
    ]);
    siteConfig = apiConfig;
    partners = apiPartners;
    tours = apiTours.map(mapAPITour);
    events = apiEvents.map(mapAPIEvent);
    testimonials = apiTestimonials.map((t) => ({
      name: t.name,
      location: t.location,
      text: t.text,
      image: t.image || "/img/placeholder-avatar.jpg",
      rating: t.rating,
    }));
  } catch {
    // API unavailable
  }

  // JSON-LD structured data for homepage
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: "Get Tours Nepal",
    description: "Book the best local travel experiences, guided tours, trekking adventures, and cultural events across Nepal.",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Kathmandu",
      addressCountry: "NP",
    },
    sameAs: [],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "10000",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient tours={tours} events={events} testimonials={testimonials} siteConfig={siteConfig} partners={partners} />
    </>
  );
}
