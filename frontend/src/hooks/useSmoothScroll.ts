"use client";

import { useEffect, useRef } from "react";
import type Lenis from "lenis";

export default function useSmoothScroll({ enabled = true }: { enabled?: boolean } = {}) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

    if (prefersReducedMotion || isTouchDevice) {
      return;
    }

    let cancelled = false;
    let rafId = 0;

    function raf(time: number, lenis: Lenis) {
      lenis.raf(time);
      rafId = requestAnimationFrame((nextTime) => raf(nextTime, lenis));
    }

    async function startSmoothScroll() {
      const { default: LenisRuntime } = await import("lenis");
      if (cancelled) {
        return;
      }

      const lenis = new LenisRuntime({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        touchMultiplier: 2,
      });

      lenisRef.current = lenis;
      rafId = requestAnimationFrame((time) => raf(time, lenis));
    }

    startSmoothScroll().catch(() => undefined);

    return () => {
      cancelled = true;
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      lenisRef.current?.destroy();
      lenisRef.current = null;
    };
  }, [enabled]);

  return lenisRef;
}
