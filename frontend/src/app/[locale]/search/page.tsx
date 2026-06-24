import { getTours, getEvents } from "@/lib/api";
import { mapAPITour, mapAPIEvent } from "@/lib/mappers";
import SearchClient from "./SearchClient";

export const revalidate = 0;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() || "";

  const [tours, events] = await Promise.all([
    getTours(query ? { search: query } : {}).catch(() => []),
    getEvents(query ? { search: query } : {}).catch(() => []),
  ]);

  return (
    <SearchClient
      query={query}
      tours={tours.map(mapAPITour)}
      events={events.map(mapAPIEvent)}
    />
  );
}
