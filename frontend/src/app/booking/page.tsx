import type { Metadata } from "next";
import { getTours, getEvents } from "@/lib/api";
import { mapAPITour, mapAPIEvent } from "@/lib/mappers";
import BookingClient from "./BookingClient";
import type { Event, Tour } from "@/types";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Book Your Adventure — Tours & Events Booking",
  description: "Book your Nepal adventure now. Choose from 150+ tour packages and events. Secure booking, instant confirmation, and best price guarantee.",
  openGraph: {
    title: "Book Your Adventure — Get Tours Nepal",
    description: "Book your Nepal adventure now. Secure booking, instant confirmation, and best price guarantee.",
    url: "/booking",
  },
};

export default async function BookingPage() {
  let tours: Tour[] = [];
  let events: Event[] = [];

  try {
    const apiTours = await getTours();
    tours = apiTours.map(mapAPITour);
  } catch {}

  try {
    const apiEvents = await getEvents();
    events = apiEvents.map(mapAPIEvent);
  } catch {}

  return <BookingClient tours={tours} events={events} />;
}
