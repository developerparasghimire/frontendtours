import type { Metadata } from "next";
import EventDetailClient from "./EventDetailClient";
import { getEventBySlug, getEventReviews } from "@/lib/api";
import { mapAPIEvent } from "@/lib/mappers";
import { notFound } from "next/navigation";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://gettours.com.np";

// H11: ISR — detail pages rebuild at most once every 5 minutes.
export const revalidate = 300;

async function getEvent(id: string) {
  const apiEvent = await getEventBySlug(id);
  const mapped = mapAPIEvent(apiEvent);
  return {
    ...mapped,
    numericId: apiEvent.id,
    availableTickets: apiEvent.available_tickets,
    totalTickets: apiEvent.total_tickets,
  };
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const event = await getEvent(id);
    return {
      title: `${event.title} — Nepal Event`,
      description: event.description,
      alternates: { canonical: `${SITE_URL}/events/${id}` },
      openGraph: {
        title: `${event.title} | Get Tours Nepal`,
        description: event.description,
        images: [{ url: event.image, width: 1200, height: 630, alt: event.title }],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: event.title,
        description: event.description,
        images: [event.image],
      },
    };
  } catch {
    return { title: "Event Not Found" };
  }
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let event;
  try {
    event = await getEvent(id);
  } catch {
    notFound();
  }

  // Fetch reviews for structured data
  let reviewCount = 0;
  let avgRating = 4.5;
  try {
    if (event.numericId) {
      const reviews = await getEventReviews(event.numericId);
      reviewCount = reviews.length;
      if (reviewCount > 0) {
        avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount;
      }
    }
  } catch {
    // use defaults
  }

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    image: event.image,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: event.location || "Nepal",
    },
    organizer: {
      "@type": "Organization",
      name: "Get Tours Nepal",
      url: SITE_URL,
    },
    offers: {
      "@type": "Offer",
      price: event.price === "Free" ? "0" : event.price.replace(/[^\d.]/g, ""),
      priceCurrency: "USD",
      availability: event.availableTickets === 0
        ? "https://schema.org/SoldOut"
        : "https://schema.org/InStock",
    },
  };

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
      <EventDetailClient event={event} />
    </>
  );
}
