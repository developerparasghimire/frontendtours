"use client";

// Invisible component — renders nothing, handles all GT side effects:
//  1. Initial translation on mount (syncs path locale → storage, triggers translation,
//     with a one-shot reload fallback if GT doesn't initialize within 4s)
//  2. Re-translation on Next.js route changes (client-side navigation)
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
    // Path locale (e.g. /zh → "zh" → "zh-CN") takes priority over localStorage
    const pathLocale = getPathLocale(window.location.pathname);
    const pathCode = pathLocale ? (LOCALE_TO_CODE[pathLocale] ?? pathLocale) : null;

    let lang: string;
    if (pathCode && pathCode !== GT_DEFAULT) {
      storeLang(pathCode);
      lang = pathCode;
    } else {
      lang = getStoredLang();
    }

    if (lang === GT_DEFAULT) return;

    // Primary: poll for GT combo element, then trigger translation
    cancelRef.current = translateWhenReady(lang, 6000);

    // Fallback: if the page is still untranslated after 4s, reload once.
    // GT reliably reads the googtrans cookie on a fresh page load.
    const reloadKey = `gt_reloaded_${lang}_${window.location.pathname}`;
    const fallback = setTimeout(() => {
      if (sessionStorage.getItem(reloadKey)) return;
      const translated =
        document.body.classList.contains("translated-ltr") ||
        document.body.classList.contains("translated-rtl");
      if (!translated) {
        sessionStorage.setItem(reloadKey, "1");
        window.location.reload();
      }
    }, 4000);

    return () => {
      if (cancelRef.current) cancelRef.current();
      clearTimeout(fallback);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 2. Route change (client-side navigation) ─────────────────────────────
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
