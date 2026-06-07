"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getActiveEventPopup, type EventPopup } from "@/lib/api";
import { isSafeExternalUrl, isSafeRedirect } from "@/lib/sanitize";

const SESSION_KEY = "gt_popup_dismissed_at";

export default function EventPopupBanner() {
  const [popup, setPopup] = useState<EventPopup | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    getActiveEventPopup()
      .then((data) => {
        if (!data) return;
        // If the popup was updated after the user dismissed it, show it again
        const dismissedAt = sessionStorage.getItem(SESSION_KEY);
        if (dismissedAt && data.updated_at && dismissedAt >= data.updated_at) return;
        setPopup(data);
        setVisible(true);
      })
      .catch(() => {});
  }, []);

  function dismiss() {
    setVisible(false);
    sessionStorage.setItem(SESSION_KEY, popup?.updated_at || new Date().toISOString());
  }

  if (!visible || !popup) return null;

  const url = popup.button_url ?? "";
  const isExternal = isSafeExternalUrl(url);
  const isInternal = !isExternal && isSafeRedirect(url);
  // Block popups with a non-empty but unsafe URL (e.g. javascript:)
  if (url && !isExternal && !isInternal) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) dismiss();
      }}
    >
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
        {/* Close button */}
        <button
          onClick={dismiss}
          aria-label="Close popup"
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-gray-700 hover:text-brand-navy shadow transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Poster image */}
        {popup.image && (
          <div className="relative w-full aspect-[3/4] sm:aspect-video">
            <Image
              src={popup.image}
              alt={popup.title || "Event Poster"}
              fill
              className="object-cover"
              unoptimized
              priority
            />
          </div>
        )}

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4">
          {popup.title && (
            <h2 className="text-xl sm:text-2xl font-bold text-brand-navy leading-tight">
              {popup.title}
            </h2>
          )}

          {(isExternal || isInternal) && (
            isExternal ? (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={dismiss}
                className="block w-full text-center bg-brand-navy text-white font-semibold py-3 px-6 rounded-xl hover:bg-brand-navy/90 transition-colors"
              >
                {popup.button_text || "View Details"}
              </a>
            ) : (
              <Link
                href={url}
                onClick={dismiss}
                className="block w-full text-center bg-brand-navy text-white font-semibold py-3 px-6 rounded-xl hover:bg-brand-navy/90 transition-colors"
              >
                {popup.button_text || "View Details"}
              </Link>
            )
          )}
        </div>
      </div>
    </div>
  );
}
