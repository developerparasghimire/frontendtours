import type { Metadata } from "next";
import { getEvents } from "@/lib/api";
import { mapAPIEvent } from "@/lib/mappers";
import type { Event } from "@/types";
import EventsClient from "./EventsClient";

// H11: ISR — list pages rebuild at most once every 5 minutes.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Events & Experiences in Nepal — Festivals, Concerts & Cultural Events",
  description: "Discover amazing events across Nepal. Concerts, cultural walks, festivals, cooking classes, and unique local experiences. Book your spot today.",
  openGraph: {
    title: "Events & Experiences — Get Tours Nepal",
    description: "Discover amazing events across Nepal. Concerts, cultural walks, festivals, and local experiences.",
    url: "/events",
  },
};

export default async function EventsPage() {
  let events: Event[] = [];

  try {
    const apiEvents = await getEvents();
    events = apiEvents.map(mapAPIEvent);
  } catch {
    // API unavailable
  }

  return <EventsClient events={events} />;
}
