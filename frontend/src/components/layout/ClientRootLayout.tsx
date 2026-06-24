"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { AuthProvider } from "@/lib/auth";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { TranslationProvider } from "@/context/TranslationContext";
import ScrollToTop from "@/components/shared/ScrollToTop";
import WhatsAppWidget from "@/components/shared/WhatsAppWidget";
import EventPopupBanner from "@/components/shared/EventPopupBanner";
import useSmoothScroll from "@/hooks/useSmoothScroll";
import { stripLocale } from "@/lib/googleTranslate";

function useStaleServiceWorkerCleanup() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    const cleanup = async () => {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));

      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
      }
    };

    cleanup().catch(() => undefined);
  }, []);
}

function LayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Strip locale prefix (/de/tours → /tours) before checking path type
  const path = stripLocale(pathname ?? "");
  const isAdmin = path.startsWith("/gettoursadmin");
  const isDashboard = path.startsWith("/dashboard");
  const isBookingFlow = path.startsWith("/booking");
  const isAuthPage =
    path === "/login" ||
    path === "/register" ||
    path === "/forgot-password" ||
    path.startsWith("/reset-password");
  const useEnhancedScrolling = !isAdmin && !isDashboard && !isBookingFlow && !isAuthPage;

  useStaleServiceWorkerCleanup();
  useSmoothScroll({ enabled: useEnhancedScrolling });

  const showChrome = !isAdmin && !isAuthPage;

  return (
    <>
      {showChrome && <Navbar />}
      <main>{children}</main>
      {showChrome && <Footer />}
      <ScrollToTop />
      {showChrome && <WhatsAppWidget />}
      {showChrome && <EventPopupBanner />}
    </>
  );
}

export default function ClientRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <TranslationProvider>
        <CurrencyProvider>
          <LayoutInner>{children}</LayoutInner>
        </CurrencyProvider>
      </TranslationProvider>
    </AuthProvider>
  );
}
