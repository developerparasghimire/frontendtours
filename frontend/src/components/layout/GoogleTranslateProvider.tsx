"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { getStoredLang, GT_DEFAULT } from "@/lib/googleTranslate";

type GTWindow = typeof window & { doGTranslate?: (pair: string) => void };

function applyStored() {
  const lang = getStoredLang();
  if (lang === GT_DEFAULT) return;
  const pair = `en|${lang}`;

  const doGT = (window as GTWindow).doGTranslate;
  if (typeof doGT === "function") { doGT(pair); return; }

  const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
  if (combo && combo.options.length > 1) {
    combo.value = lang;
    combo.dispatchEvent(new Event("change", { bubbles: true }));
  }
}

export default function GoogleTranslateProvider() {
  const pathname = usePathname();
  const prevPath = useRef<string | null>(null);
  const mutationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isBusy = useRef(false);

  // On mount: apply stored language once GT boots
  useEffect(() => {
    const lang = getStoredLang();
    if (lang === GT_DEFAULT) return;

    // Poll until doGTranslate or combo is available (max 8s)
    const start = Date.now();
    const tick = () => {
      const doGT = (window as GTWindow).doGTranslate;
      const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
      if (typeof doGT === "function" || (combo && combo.options.length > 1)) {
        applyStored();
        return;
      }
      if (Date.now() - start < 8000) setTimeout(tick, 200);
    };
    const t = setTimeout(tick, 500); // give GT script 500ms head-start
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-apply on client-side navigation
  useEffect(() => {
    if (pathname.startsWith("/gettoursadmin")) return;
    if (prevPath.current !== null && prevPath.current !== pathname) {
      const t = setTimeout(applyStored, 150);
      return () => clearTimeout(t);
    }
    prevPath.current = pathname;
  }, [pathname]);

  // Re-apply when dynamic content (API data) appears in DOM
  useEffect(() => {
    const lang = getStoredLang();
    if (lang === GT_DEFAULT) return;
    if (pathname.startsWith("/gettoursadmin")) return;

    const isGTNode = (n: Node) => {
      if (n.nodeType !== Node.ELEMENT_NODE) return false;
      const el = n as Element;
      return el.classList?.contains("skiptranslate") || el.tagName === "FONT" || !!el.closest?.("#google_translate_element");
    };

    const observer = new MutationObserver((mutations) => {
      if (isBusy.current) return;
      const hasNew = mutations.some(
        (m) => m.type === "childList" && Array.from(m.addedNodes).some((n) => !isGTNode(n) && n.nodeType === Node.ELEMENT_NODE)
      );
      if (!hasNew) return;
      if (mutationTimer.current) clearTimeout(mutationTimer.current);
      mutationTimer.current = setTimeout(() => {
        isBusy.current = true;
        applyStored();
        setTimeout(() => { isBusy.current = false; }, 1200);
      }, 350);
    });

    observer.observe(document.querySelector("main") ?? document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      if (mutationTimer.current) clearTimeout(mutationTimer.current);
    };
  }, [pathname]);

  return null;
}
