"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { useCurrency, CURRENCIES } from "@/context/CurrencyContext";
import { useTranslation } from "@/context/TranslationContext";
import { stripLocale } from "@/lib/googleTranslate";

const NAV_LINK_KEYS = [
  { href: "/",        key: "nav.home"    },
  { href: "/about",   key: "nav.about"   },
  { href: "/events",  key: "nav.events"  },
  { href: "/tours",   key: "nav.tours"   },
  { href: "/blog",    key: "nav.blogs"   },
  { href: "/contact", key: "nav.contact" },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [currencyMenuOpen, setCurrencyMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const pathname = usePathname();
  const { user, isAuthenticated, logout, loading } = useAuth();
  const { currency, setCurrency, currencyInfo } = useCurrency();
  const { t } = useTranslation();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const currencyMenuRef = useRef<HTMLDivElement>(null);
  const cleanPath = stripLocale(pathname);
  const currentLocale: string | null = null;
  const isHome = cleanPath === "/";
  const isOverlayNav = isHome && !scrolled && !isMobileMenuOpen;
  const showBrandText = !scrolled;

  useEffect(() => {
    const onScroll = () => { setScrolled(window.scrollY > 20); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (currencyMenuRef.current && !currencyMenuRef.current.contains(e.target as Node)) {
        setCurrencyMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const userInitials = user
    ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase() || user.username[0].toUpperCase()
    : "";

  const closeMenus = () => {
    setIsMobileMenuOpen(false);
    setUserMenuOpen(false);
  };

  useEffect(() => {
    const setNavHeight = () => {
      const h = navRef.current?.offsetHeight ?? 64;
      document.documentElement.style.setProperty("--nav-height", `${h}px`);
    };
    setNavHeight();
    window.addEventListener("resize", setNavHeight);
    return () => window.removeEventListener("resize", setNavHeight);
  }, [isMobileMenuOpen]);

  return (
    <motion.nav
      ref={navRef}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        isOverlayNav
          ? "border-b border-transparent bg-[linear-gradient(180deg,rgba(0,0,0,0.38),rgba(0,0,0,0))] shadow-none"
          : "border-b border-white/55 bg-white/82 backdrop-blur-xl shadow-[0_20px_60px_-35px_rgba(22,43,57,0.42)]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link
            href="/"
            onClick={closeMenus}
            className={`flex items-center shrink-0 transition-[gap] duration-300 ${showBrandText ? "gap-3" : "gap-0"}`}
          >
            <Image
              src="/logo.png"
              alt="Get Tours Logo"
              width={60}
              height={60}
              className="rounded-xl object-cover shadow-[0_12px_30px_-18px_rgba(22,43,57,0.45)]"
              priority
            />
            <span
              aria-hidden={!showBrandText}
              className={`overflow-hidden whitespace-nowrap text-base font-semibold tracking-[0.02em] transition-all duration-300 ${
                showBrandText
                  ? `max-w-[9rem] opacity-100 ${isOverlayNav ? "text-white" : "text-brand-navy"}`
                  : "max-w-0 opacity-0"
              }`}
            >
              GET TOURS
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            <div
              className={`mr-3 flex items-center gap-1 rounded-full px-2 py-1 transition-all duration-300 ${
                isOverlayNav ? "bg-transparent px-0 py-0 backdrop-blur-0" : "bg-brand-navy/[0.035]"
              }`}
            >
              {NAV_LINK_KEYS.map((link) => {
                const isActive = cleanPath === link.href || (link.href !== "/" && cleanPath.startsWith(link.href));
                const linkHref = currentLocale && currentLocale !== "en" ? `/${currentLocale}${link.href === "/" ? "" : link.href}` : link.href;
                return (
                  <Link
                    key={link.href}
                    href={linkHref}
                    onClick={closeMenus}
                    className={`relative rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 group ${
                      isOverlayNav
                        ? isActive ? "text-white" : "text-white/70 hover:text-white"
                        : isActive ? "text-brand-red" : "text-gray-600 hover:text-brand-navy"
                    }`}
                  >
                    {t(link.key)}
                    <span
                      className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-all duration-300 ${
                        isOverlayNav ? "bg-white" : "bg-[linear-gradient(90deg,var(--color-brand-red),var(--color-brand-orange))]"
                      } ${isActive ? "w-5" : "w-0 group-hover:w-5"}`}
                    />
                  </Link>
                );
              })}
            </div>

            {/* Currency Selector */}
            <div className="relative ml-1" ref={currencyMenuRef}>
              <button
                onClick={() => setCurrencyMenuOpen((o) => !o)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  isOverlayNav
                    ? "text-white/80 hover:bg-white/10"
                    : "text-brand-navy hover:bg-brand-navy/5 border border-gray-200"
                }`}
                aria-label="Select currency"
              >
                {currencyInfo.symbol} {currency}
                <svg className={`w-3 h-3 transition-transform ${currencyMenuOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {currencyMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 max-h-72 overflow-y-auto">
                  {CURRENCIES.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => { setCurrency(c.code); setCurrencyMenuOpen(false); }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                        currency === c.code ? "bg-brand-navy/5 text-brand-navy font-bold" : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span>{c.label}</span>
                      {currency === c.code && (
                        <svg className="w-3.5 h-3.5 text-brand-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Separator + Auth */}
            <div className={`flex items-center gap-3 ml-4 pl-4 border-l ${isOverlayNav ? "border-white/20" : "border-gray-200"}`}>
              {loading ? (
                <div className={`w-8 h-8 rounded-full animate-pulse ${isOverlayNav ? "bg-white/20" : "bg-gray-200"}`} />
              ) : isAuthenticated && user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all duration-200 ${
                      isOverlayNav ? "hover:bg-white/10" : "hover:bg-gray-100"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-brand-red flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {userInitials}
                    </div>
                    <span className={`text-sm font-medium hidden lg:inline ${isOverlayNav ? "text-white" : "text-brand-navy"}`}>
                      {user.first_name || user.username}
                    </span>
                    <svg className={`w-4 h-4 transition-all duration-200 ${isOverlayNav ? "text-white/70" : "text-gray-500"} ${userMenuOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-fade-in z-50">
                      <div className="px-5 py-4 bg-gray-50 border-b border-gray-100">
                        <p className="font-bold text-brand-navy text-sm">{user.first_name} {user.last_name}</p>
                        <p className="text-gray-500 text-xs mt-0.5 truncate">{user.email}</p>
                      </div>
                      <div className="py-2">
                        <Link href="/dashboard" onClick={closeMenus} className="flex items-center gap-3 px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                          {t("nav.dashboard")}
                        </Link>
                        <Link href="/dashboard#bookings" onClick={closeMenus} className="flex items-center gap-3 px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          {t("nav.my_bookings")}
                        </Link>
                      </div>
                      <div className="border-t border-gray-100 py-2">
                        <button
                          onClick={logout}
                          className="flex items-center gap-3 px-5 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          {t("nav.sign_out")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={closeMenus}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-5 py-2 text-sm font-semibold shadow-sm transition-all duration-200 active:scale-95 hover:shadow-md ${
                      isOverlayNav
                        ? "border border-white/16 bg-white/8 text-white hover:bg-white/14"
                        : "bg-[linear-gradient(90deg,var(--color-brand-red),var(--color-brand-orange))] text-white hover:-translate-y-0.5"
                    }`}
                  >
                    {t("nav.sign_in")}
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center gap-2">
            {!loading && isAuthenticated && user && (
              <Link href="/dashboard" onClick={closeMenus} className="p-2">
                <div className="w-8 h-8 rounded-full bg-brand-red flex items-center justify-center text-white font-bold text-xs shadow-md">
                  {userInitials}
                </div>
              </Link>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-lg transition-colors ${
                isOverlayNav ? "text-white hover:bg-white/10" : "text-gray-700 hover:bg-brand-navy/5"
              }`}
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden overflow-hidden"
          >
            <div className="border-t border-white/50 bg-white/92 px-4 py-3 shadow-xl backdrop-blur-xl">
              <div className="space-y-0.5">
                {NAV_LINK_KEYS.map((link) => {
                  const isActive = cleanPath === link.href || (link.href !== "/" && cleanPath.startsWith(link.href));
                  const linkHref = currentLocale && currentLocale !== "en" ? `/${currentLocale}${link.href === "/" ? "" : link.href}` : link.href;
                  return (
                    <Link
                      key={link.href}
                      href={linkHref}
                      onClick={closeMenus}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        isActive ? "text-brand-red bg-brand-red/5" : "text-gray-700 hover:bg-gray-50 hover:text-brand-navy"
                      }`}
                    >
                      {t(link.key)}
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />}
                    </Link>
                  );
                })}
              </div>

              {/* Mobile Currency + Translate */}
              <div className="border-t border-gray-100 mt-3 pt-3">
                <p className="px-4 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Currency</p>
                <div className="flex flex-wrap gap-2 px-4 pb-3">
                  {CURRENCIES.map((c) => (
                    <button key={c.code} onClick={() => { setCurrency(c.code); closeMenus(); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${currency === c.code ? "bg-brand-navy text-white border-brand-navy" : "border-gray-200 text-gray-600 hover:border-brand-navy hover:text-brand-navy"}`}>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Auth Section */}
              <div className="border-t border-gray-100 mt-3 pt-3">
                {isAuthenticated && user ? (
                  <>
                    <div className="px-4 py-2.5 mb-1 bg-gray-50 rounded-xl">
                      <p className="font-semibold text-brand-navy text-sm">{user.first_name} {user.last_name}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{user.email}</p>
                    </div>
                    <Link href="/dashboard" onClick={closeMenus} className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Dashboard
                    </Link>
                    <Link href="/dashboard#bookings" onClick={closeMenus} className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      My Bookings
                    </Link>
                    <button
                      onClick={logout}
                      className="flex items-center gap-2.5 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={closeMenus}
                    className="flex items-center justify-center gap-1.5 w-full py-3 rounded-xl text-sm font-semibold bg-brand-red text-white hover:bg-red-700 transition-colors"
                  >
                    Sign In
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
