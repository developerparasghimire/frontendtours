"use client";

import Link from "next/link";
import Image from "next/image";
import type { Tour } from "@/types";
import { shouldUseUnoptimizedImage } from "@/lib/images";
import TourImagePlaceholder from "@/components/shared/TourImagePlaceholder";
import { useCurrency } from "@/context/CurrencyContext";
import { useTranslation } from "@/context/TranslationContext";

function getTourDurationParts(durationLabel?: string) {
  if (!durationLabel) {
    return { value: "", label: "Journey" };
  }

  const match = durationLabel.match(/(\d+)\s*(.*)/);
  if (!match) {
    return { value: durationLabel, label: "Journey" };
  }

  return {
    value: match[1],
    label: match[2] || "Days",
  };
}

export default function TourCard(tour: Tour & { compact?: boolean }) {
  const durationParts = getTourDurationParts(tour.duration);
  const { formatPrice } = useCurrency();
  const { t } = useTranslation();
  const displayPrice = tour.basePrice ? formatPrice(tour.basePrice) : tour.price;

  return (
    <Link href={`/tours/${tour.id}`} className="group block">
      <div className="relative overflow-hidden bg-[#171717]">
        <div className="relative aspect-[4/3.8] sm:aspect-[4/4.2] lg:aspect-[4/4.6]">
          {tour.image ? (
            <Image
              src={tour.image}
              alt={tour.title}
              fill
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              loading="lazy"
              quality={72}
              unoptimized={shouldUseUnoptimizedImage(tour.image)}
            />
          ) : (
            <TourImagePlaceholder title={tour.title} />
          )}
          <div className="absolute inset-0 bg-black/20 transition-opacity duration-500 group-hover:bg-black/10" />
          <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-black via-black/80 to-transparent transition-all duration-500 group-hover:h-[78%]" />

          <div className="absolute left-5 top-5 right-5 flex items-start justify-between gap-3">
            <span className="rounded-full border border-white/15 bg-black/25 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.28em] text-white/70 backdrop-blur-sm">
              {tour.badge || tour.category || "Journey"}
            </span>
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/80 backdrop-blur-sm">
              {displayPrice}
            </span>
          </div>

          <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 text-center transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-[calc(50%+12px)]">
            <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-white/55 sm:text-[11px]">
              {durationParts.label}
            </p>
            <div className="mt-2 text-3xl font-semibold leading-none tracking-[-0.06em] text-white sm:text-4xl lg:text-5xl">
              {durationParts.value}
            </div>
            <h3 className="mx-auto mt-3 max-w-[12rem] text-base font-semibold leading-tight text-white sm:text-lg">
              {tour.title}
            </h3>
          </div>

          <div className="absolute inset-x-6 bottom-5 flex items-end justify-between gap-4 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:bottom-8">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-white/45">
                {tour.location || "Nepal"}
              </p>
              <p className="mt-1 text-sm text-white/75">{tour.difficulty || "Moderate"}</p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/90 sm:text-[11px]">
              {t("common.explore_tour")}
              <svg className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M4 12h16" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
