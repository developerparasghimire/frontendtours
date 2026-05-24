import { getTours, getEvents, getTestimonials, getSiteConfig, getPartners, getCategories, getAboutStats, getValues, type SiteConfig, type APIPartner, type APICategory, type APIAboutStat, type APIValue } from "@/lib/api";
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
  let featuredCategories: APICategory[] = [];
  let aboutStats: APIAboutStat[] = [];
  let aboutValues: APIValue[] = [];

  try {
    const [apiTours, apiEvents, apiTestimonials, apiConfig, apiPartners, apiCategories, apiStats, apiValues] = await Promise.all([
      getTours({ is_latest: true }).catch(() => []),
      getEvents({ is_latest: true }).catch(() => []),
      getTestimonials().catch(() => []),
      getSiteConfig().catch(() => null),
      getPartners().catch(() => []),
      getCategories({ is_active: true, is_featured: true, ordering: "order", limit: 6 }).catch(() => [] as APICategory[]),
      getAboutStats().catch(() => [] as APIAboutStat[]),
      getValues().catch(() => [] as APIValue[]),
    ]);
    siteConfig = apiConfig;
    partners = apiPartners;
    featuredCategories = apiCategories;
    aboutStats = apiStats;
    aboutValues = apiValues;
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
      <HomeClient tours={tours} events={events} testimonials={testimonials} siteConfig={siteConfig} partners={partners} featuredCategories={featuredCategories} aboutStats={aboutStats} aboutValues={aboutValues} />
    </>
  );
}
