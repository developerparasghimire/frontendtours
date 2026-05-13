import type { Metadata } from "next";
import TourDetailClient from "./TourDetailClient";
import { getTourBySlug, getTourReviews } from "@/lib/api";
import { mapAPITour } from "@/lib/mappers";
import { notFound } from "next/navigation";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://gettours.com.np";

// H11: ISR — detail pages rebuild at most once every 5 minutes.
export const revalidate = 300;

async function getTour(id: string) {
  const apiTour = await getTourBySlug(id);
  return mapAPITour(apiTour);
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const tour = await getTour(id);
    const images = tour.image
      ? [{ url: tour.image, width: 1200, height: 630, alt: tour.title }]
      : undefined;

    return {
      title: `${tour.title} — Nepal Tour Package`,
      description: tour.description,
      alternates: { canonical: `${SITE_URL}/tours/${id}` },
      openGraph: {
        title: `${tour.title} | Get Tours Nepal`,
        description: tour.description,
        url: `${SITE_URL}/tours/${id}`,
        type: "article",
        images,
      },
      twitter: {
        card: tour.image ? "summary_large_image" : "summary",
        title: tour.title,
        description: tour.description,
        images: tour.image ? [tour.image] : undefined,
      },
    };
  } catch {
    return { title: "Tour Not Found" };
  }
}

export default async function TourDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let tour;
  try {
    tour = await getTour(id);
  } catch {
    notFound();
  }

  // Fetch reviews for structured data
  let reviewCount = 0;
  let avgRating = tour.rating || 4.5;
  try {
    if (tour.numericId) {
      const reviews = await getTourReviews(tour.numericId);
      reviewCount = reviews.length;
      if (reviewCount > 0) {
        avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount;
      }
    }
  } catch {
    // use defaults
  }

  // JSON-LD structured data for SEO
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: tour.title,
    description: tour.description,
    touristType: tour.category || "Adventure",
    offers: {
      "@type": "Offer",
      price: tour.price.replace(/[^\d.]/g, ""),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    provider: {
      "@type": "TravelAgency",
      name: "Get Tours Nepal",
      url: SITE_URL,
    },
  };

  if (tour.image) {
    jsonLd.image = tour.image;
  }

  if (reviewCount > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: avgRating.toFixed(1),
      reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TourDetailClient tour={tour} />
    </>
  );
}
