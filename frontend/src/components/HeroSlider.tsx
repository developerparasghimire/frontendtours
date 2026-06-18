"use client";

import { type FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import type { SiteConfig } from "@/lib/api";
import { useTranslation } from "@/context/TranslationContext";

interface HeroSliderProps {
  siteConfig?: SiteConfig | null;
}

const HERO_ASSET_VERSION = "hero-refresh-2026-04-16";

export default function HeroSlider({ siteConfig }: HeroSliderProps) {
  const [isReady, setIsReady] = useState(false);
  const [query, setQuery] = useState("");
  const prefersReducedMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const router = useRouter();

  useEffect(() => {
    const timeout = window.setTimeout(() => setIsReady(true), 140);
    return () => window.clearTimeout(timeout);
  }, []);

  const { t } = useTranslation();
  const siteName = siteConfig?.site_name || "Get Tours Nepal";
  const backgroundY = useTransform(scrollY, [0, 720], [0, prefersReducedMotion ? 0 : 240]);
  const portraitY = useTransform(scrollY, [0, 720], [0, prefersReducedMotion ? 0 : 170]);
  const foregroundY = useTransform(scrollY, [0, 720], [0, prefersReducedMotion ? 0 : 80]);
  const backgroundScale = useTransform(scrollY, [0, 720], [1.02, prefersReducedMotion ? 1.02 : 1.12]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    const params = new URLSearchParams();
    if (trimmed) params.set("q", trimmed);
    const qs = params.toString();
    router.push(`/search${qs ? `?${qs}` : ""}`);
  };

  return (
    <header className="relative min-h-[840px] overflow-hidden bg-black sm:min-h-screen">
      <h1 className="sr-only">{siteName}</h1>
      <motion.div
        className="absolute inset-0 z-0 will-change-transform"
        style={{ y: backgroundY, scale: backgroundScale }}
        initial={{ opacity: 0, scale: 1.08 }}
        animate={isReady ? { opacity: 1, scale: 1.02 } : {}}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <Image
          src={`/img/test1.jpeg?v=${HERO_ASSET_VERSION}`}
          alt=""
          fill
          priority
          quality={68}
          sizes="100vw"
          className="object-cover object-center"
        />
      </motion.div>

      <motion.div
        className="pointer-events-none absolute inset-0 z-[40] flex justify-center items-start pt-40 will-change-transform"
        style={{ y: portraitY }}
        initial={{ opacity: 0, y: 72 }}
        animate={isReady ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1.05, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="relative h-[40%] w-[40%] -translate-x-12 -translate-y-4 sm:-translate-x-16 sm:-translate-y-6 md:-translate-x-20 md:-translate-y-8">
          <Image
            src={`/img/landscape_gettours.png?v=${HERO_ASSET_VERSION}`}
            alt=""
            fill
            loading="lazy"
            quality={76}
            sizes="(max-width: 768px) 40vw, 30vw"
            className="object-contain"
          />
        </div>
      </motion.div>

      <motion.div
        className="pointer-events-none absolute inset-0 z-[1] will-change-transform"
        style={{ y: foregroundY }}
        initial={{ opacity: 0, y: 48 }}
        animate={isReady ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.95, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="relative ml-auto h-full w-[92%] translate-y-16 sm:translate-y-20 md:translate-y-24 sm:w-[88%] md:w-[84%]">
          <div className="relative h-full w-full pl-10 sm:pl-14 md:pl-20">
            <Image
              src={`/img/test2.png?v=${HERO_ASSET_VERSION}`}
              alt=""
              fill
              loading="lazy"
              quality={68}
              sizes="(max-width: 768px) 92vw, (max-width: 1024px) 88vw, 84vw"
              className="object-contain object-bottom-right"
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        className="pointer-events-none absolute inset-0 z-50 flex flex-col items-center justify-center text-center px-4 pt-16 sm:pt-20"
        initial={{ opacity: 0, y: 30 }}
        animate={isReady ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="pointer-events-auto w-full max-w-5xl">
        

          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-8 max-w-2xl"
          >
            <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white px-4 py-2 shadow-[0_16px_48px_-16px_rgba(0,0,0,0.5)]">
              <svg className="h-4 w-4 flex-shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("hero.search_placeholder")}
                className="flex-1 border-none bg-transparent text-sm font-medium text-brand-navy outline-none placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="flex-shrink-0 rounded-full bg-brand-red px-5 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#c11000]"
              >
                {t("hero.search_btn")}
              </button>
            </div>
          </form>

        </div>
      </motion.div>

    </header>
  );
}
