"use client";

// Invisible component — renders nothing, handles all GT side effects:
//  1. Initial translation on mount (syncs path locale → storage, then translates)
//  2. Re-translation on every Next.js route change
//  3. MutationObserver re-translation when Django API data loads into DOM

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  getStoredLang, storeLang, translateWhenReady, applyTranslation,
  GT_DEFAULT, getPathLocale, LOCALE_TO_CODE,
} from "@/lib/googleTranslate";

export default function GoogleTranslateProvider() {
  const pathname = usePathname();
  const prevPath = useRef<string | null>(null);
  const cancelRef = useRef<(() => void) | null>(null);
  const mutationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isBusy = useRef(false);

  const schedule = (delayMs: number, lang: string) => {
    if (cancelRef.current) { cancelRef.current(); cancelRef.current = null; }
    const t = setTimeout(() => {
      cancelRef.current = translateWhenReady(lang);
    }, delayMs);
    return () => clearTimeout(t);
  };

  // ── 1. Initial mount ─────────────────────────────────────────────────────
  useEffect(() => {
    // If the URL has a locale prefix (/de, /fr, etc.), that wins
    const pathLocale = getPathLocale(window.location.pathname);
    const pathCode = pathLocale ? (LOCALE_TO_CODE[pathLocale] ?? pathLocale) : null;

    let lang: string;
    if (pathCode && pathCode !== GT_DEFAULT) {
      storeLang(pathCode);   // sync URL locale into localStorage + cookie
      lang = pathCode;
    } else {
      lang = getStoredLang();
    }

    if (lang === GT_DEFAULT) return;
    cancelRef.current = translateWhenReady(lang);
    return () => { if (cancelRef.current) cancelRef.current(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 2. Route change ──────────────────────────────────────────────────────
  useEffect(() => {
    if (pathname.startsWith("/gettoursadmin")) return;

    const lang = getStoredLang();
    if (lang === GT_DEFAULT) return;

    if (prevPath.current !== null && prevPath.current !== pathname) {
      const cancel = schedule(120, lang);
      prevPath.current = pathname;
      return cancel;
    }
    prevPath.current = pathname;
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 3. MutationObserver — catches async API data (Django responses) ──────
  useEffect(() => {
    const lang = getStoredLang();
    if (lang === GT_DEFAULT) return;
    if (pathname.startsWith("/gettoursadmin")) return;

    const isGTNode = (n: Node): boolean => {
      if (n.nodeType !== Node.ELEMENT_NODE) return false;
      const el = n as Element;
      return (
        el.classList?.contains("skiptranslate") ||
        el.tagName === "FONT" ||
        el.id === "google_translate_element" ||
        !!el.closest?.("#google_translate_element")
      );
    };

    const observer = new MutationObserver((mutations) => {
      if (isBusy.current) return;

      const hasNewContent = mutations.some(
        (m) => m.type === "childList" && Array.from(m.addedNodes).some((n) => !isGTNode(n) && n.nodeType === Node.ELEMENT_NODE)
      );
      if (!hasNewContent) return;

      if (mutationTimer.current) clearTimeout(mutationTimer.current);
      mutationTimer.current = setTimeout(() => {
        isBusy.current = true;
        applyTranslation(lang);
        setTimeout(() => { isBusy.current = false; }, 1200);
      }, 350);
    });

    const root = document.querySelector("main") ?? document.body;
    observer.observe(root, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      if (mutationTimer.current) clearTimeout(mutationTimer.current);
    };
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
