import type { Metadata } from "next";
import { getTours } from "@/lib/api";
import { mapAPITour } from "@/lib/mappers";
import type { Tour } from "@/types";
import ToursClient from "./ToursClient";

// H11: ISR — list pages rebuild at most once every 5 minutes.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Nepal Tour Packages — Trekking, Adventure & Cultural Tours",
  description: "Browse 150+ tour packages across Nepal. Everest Base Camp treks, Annapurna circuits, cultural tours, wildlife safaris, and day trips. Best price guarantee.",
  openGraph: {
    title: "Nepal Tour Packages — Get Tours Nepal",
    description: "Browse 150+ tour packages across Nepal. Everest Base Camp treks, Annapurna circuits, cultural tours, wildlife safaris, and day trips.",
    url: "/tours",
  },
};

type ToursPageProps = {
  searchParams?: Promise<{
    search?: string | string[];
    destination?: string | string[];
    category?: string | string[];
  }>;
};

function readFirstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ToursPage({ searchParams }: ToursPageProps) {
  let tours: Tour[] = [];
  const params = searchParams ? await searchParams : undefined;
  const keyword = readFirstParam(params?.search)?.trim() || "";
  const destination = readFirstParam(params?.destination)?.trim() || "";
  const category = readFirstParam(params?.category)?.trim() || "";
  const combinedSearch = [keyword, destination].filter(Boolean).join(" ").trim();

  try {
    const apiTours = await getTours({
      search: combinedSearch || undefined,
      category: category || undefined,
    });
    tours = apiTours.map(mapAPITour);
  } catch {
    // API unavailable
  }

  return <ToursClient tours={tours} />;
}
