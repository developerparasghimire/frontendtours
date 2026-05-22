"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useDeferredValue, useEffect, useRef, useState, useCallback, type ReactNode } from "react";
import { getMe, getAdminStats, getAdminRecentBookings, refreshToken as apiRefresh, type UserProfile } from "@/lib/api";

const NAV_SECTIONS = [
  {
    title: "Overview",
    items: [{ href: "/gettoursadmin", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" }],
  },
  {
    title: "Content",
    items: [
      { href: "/gettoursadmin/tours", label: "Tours", icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" },
      { href: "/gettoursadmin/events", label: "Events", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
      { href: "/gettoursadmin/categories", label: "Categories", icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" },
      { href: "/gettoursadmin/blog", label: "Blog Posts", icon: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" },
      { href: "/gettoursadmin/testimonials", label: "Testimonials", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
      { href: "/gettoursadmin/reviews", label: "Reviews", icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" },
      { href: "/gettoursadmin/partners", label: "Partners", icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" },
      { href: "/gettoursadmin/about", label: "About Page", icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    ],
  },
  {
    title: "Bookings",
    items: [
      { href: "/gettoursadmin/bookings/tours", label: "Tour Bookings", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
      { href: "/gettoursadmin/bookings/events", label: "Event Bookings", icon: "M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" },
    ],
  },
  {
    title: "Manage",
    items: [
      { href: "/gettoursadmin/contacts", label: "Contact Messages", icon: "M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" },
      { href: "/gettoursadmin/newsletter", label: "Newsletter", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
      { href: "/gettoursadmin/banners", label: "Page Banners", icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" },
      { href: "/gettoursadmin/settings", label: "Site Settings", icon: "M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
    ],
  },
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [navQuery, setNavQuery] = useState("");
  const [pendingCount, setPendingCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const lastSeenBookingId = useRef<number | null>(null);
  const deferredNavQuery = useDeferredValue(navQuery.trim().toLowerCase());

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.replace("/gettoursadmin/login");
      return;
    }
    getMe(token, "admin")
      .then((u) => {
        if (!["SUPER_ADMIN", "ADMIN", "STAFF"].includes(u.role)) {
          localStorage.removeItem("admin_token");
          router.replace("/gettoursadmin/login");
          return;
        }
        setUser(u);
      })
      .catch(async () => {
        // Try refreshing the token
        const refresh = localStorage.getItem("admin_refresh");
        if (refresh) {
          try {
            const res = await apiRefresh(refresh);
            localStorage.setItem("admin_token", res.access);
            localStorage.setItem("admin_refresh", res.refresh || refresh);
            const u = await getMe(res.access, "admin");
            if (!["SUPER_ADMIN", "ADMIN", "STAFF"].includes(u.role)) {
              localStorage.removeItem("admin_token");
              localStorage.removeItem("admin_refresh");
              router.replace("/gettoursadmin/login");
              return;
            }
            setUser(u);
            return;
          } catch {
            // Refresh also failed
          }
        }
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_refresh");
        router.replace("/gettoursadmin/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    const resetPanelsTimer = window.setTimeout(() => {
      setSidebarOpen(false);
      setNotifOpen(false);
    }, 0);

    return () => window.clearTimeout(resetPanelsTimer);
  }, [pathname]);

  // Poll pending count every 60 seconds
  useEffect(() => {
    const fetchPending = async () => {
      const token = localStorage.getItem("admin_token");
      if (!token) return;
      try {
        const s = await getAdminStats(token);
        setPendingCount((s.pending_tour_bookings ?? 0) + (s.pending_event_bookings ?? 0));
      } catch {
        // ignore
      }
    };
    fetchPending();
    const interval = setInterval(fetchPending, 60000);
    return () => clearInterval(interval);
  }, []);

  // Play a pleasant double-beep using Web Audio API
  const playAlertSound = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const playTone = (startTime: number, freq: number, dur: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.4, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);
        osc.start(startTime);
        osc.stop(startTime + dur);
      };
      const t = ctx.currentTime;
      playTone(t, 880, 0.15);
      playTone(t + 0.2, 1100, 0.2);
    } catch {
      // AudioContext may be blocked until user interaction — silently ignore
    }
  }, []);

  // Poll for new bookings every 30 seconds and alert on new ones
  useEffect(() => {
    const checkNewBookings = async () => {
      const token = localStorage.getItem("admin_token");
      if (!token) return;
      try {
        const recent = await getAdminRecentBookings(token, 5);
        if (recent.length === 0) return;
        const newestId = recent[0].id;
        if (lastSeenBookingId.current === null) {
          lastSeenBookingId.current = newestId;
          return;
        }
        if (newestId > lastSeenBookingId.current) {
          const newOnes = recent.filter((b) => b.id > lastSeenBookingId.current!);
          lastSeenBookingId.current = newestId;
          playAlertSound();
          const label = newOnes.length === 1
            ? `New ${newOnes[0].booking_type} booking: ${newOnes[0].title}`
            : `${newOnes.length} new bookings received`;
          setToast(label);
          setTimeout(() => setToast(null), 6000);
        }
      } catch {
        // ignore
      }
    };
    checkNewBookings();
    const interval = setInterval(checkNewBookings, 30000);
    return () => clearInterval(interval);
  }, [playAlertSound]);

  const logout = useCallback(() => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_refresh");
    router.replace("/gettoursadmin/login");
  }, [router]);

  const allItems = NAV_SECTIONS.flatMap((s) => s.items);
  const pageTitle = allItems.find((n) => n.href === pathname)?.label ?? "Admin";
  const currentSection = NAV_SECTIONS.find((section) => section.items.some((item) => item.href === pathname))?.title ?? "Overview";
  const filteredSections = NAV_SECTIONS
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (!deferredNavQuery) {
          return true;
        }

        return (
          section.title.toLowerCase().includes(deferredNavQuery) ||
          item.label.toLowerCase().includes(deferredNavQuery)
        );
      }),
    }))
    .filter((section) => section.items.length > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-gray-200 border-t-brand-navy" />
          <p className="text-sm text-gray-400">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed z-40 inset-y-0 left-0 w-[280px] bg-gradient-to-b from-brand-navy to-[#0f1b35] text-white flex flex-col transform transition-transform duration-300 lg:translate-x-0 lg:static ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <Link href="/gettoursadmin" className="flex items-center gap-2.5">
            <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-white/15">
              <Image
                src="/logo.png"
                alt="GetTours logo"
                fill
                className="object-cover"
                sizes="40px"
                priority
              />
            </div>
            <div>
              <p className="text-base font-bold leading-none">GetTours</p>
              <p className="text-[10px] text-white/40 tracking-wider uppercase">Admin Panel</p>
            </div>
          </Link>
          <button className="lg:hidden text-white/50 hover:text-white p-1" onClick={() => setSidebarOpen(false)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="px-4 pt-4">
          <label htmlFor="admin-nav-search" className="sr-only">Search admin pages</label>
          <div className="relative">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z" />
            </svg>
            <input
              id="admin-nav-search"
              type="text"
              value={navQuery}
              onChange={(e) => setNavQuery(e.target.value)}
              placeholder="Quick find a page"
              className="w-full rounded-xl border border-white/10 bg-white/8 py-2.5 pl-9 pr-9 text-sm text-white placeholder:text-white/35 focus:border-white/25 focus:outline-none"
            />
            {navQuery && (
              <button
                type="button"
                onClick={() => setNavQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-white/40 hover:bg-white/10 hover:text-white"
                aria-label="Clear navigation search"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {filteredSections.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 bg-white/5 px-4 py-5 text-sm text-white/55">
              No admin pages match &quot;{navQuery}&quot;.
            </div>
          ) : filteredSections.map((section) => (
            <div key={section.title}>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-3 mb-2">{section.title}</p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        active
                          ? "bg-white/15 text-white shadow-sm"
                          : "text-white/60 hover:bg-white/8 hover:text-white"
                      }`}
                    >
                      <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                      </svg>
                      {item.label}
                      {active && <div className="ml-auto w-1.5 h-1.5 bg-brand-red rounded-full" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User section */}
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center text-xs font-bold text-white/80 flex-shrink-0">
              {user?.email?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.first_name || user?.email?.split("@")[0]}</p>
              <p className="text-[11px] text-white/40 truncate">{user?.role?.replace("_", " ")}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/50 hover:text-white hover:bg-white/8 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3.5 flex items-center gap-4 sticky top-0 z-20 shadow-sm">
          <button className="lg:hidden text-gray-500 hover:text-brand-navy p-1.5 rounded-lg hover:bg-gray-100 transition-colors" onClick={() => setSidebarOpen(true)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-400">{currentSection}</p>
            <h1 className="text-base sm:text-lg font-bold text-brand-navy">{pageTitle}</h1>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <label htmlFor="admin-page-jump" className="sr-only">Jump to admin page</label>
            <select
              id="admin-page-jump"
              value={pathname}
              onChange={(e) => router.push(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 focus:border-brand-blue focus:outline-none lg:hidden"
            >
              {allItems.map((item) => (
                <option key={item.href} value={item.href}>
                  {item.label}
                </option>
              ))}
            </select>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen((o) => !o)}
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-800"
                aria-label="Notifications"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {pendingCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                    {pendingCount > 99 ? "99+" : pendingCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <p className="text-sm font-bold text-gray-800">Pending Bookings</p>
                    <button onClick={() => setNotifOpen(false)} className="text-gray-400 hover:text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  {pendingCount === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-gray-400">No pending bookings</div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      <Link
                        href="/gettoursadmin/bookings/tours"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-amber-50 transition-colors"
                        onClick={() => setNotifOpen(false)}
                      >
                        <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">Tour Bookings</p>
                          <p className="text-xs text-amber-600 font-medium">Review pending approvals →</p>
                        </div>
                      </Link>
                      <Link
                        href="/gettoursadmin/bookings/events"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition-colors"
                        onClick={() => setNotifOpen(false)}
                      >
                        <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">Event Bookings</p>
                          <p className="text-xs text-purple-600 font-medium">Review pending approvals →</p>
                        </div>
                      </Link>
                    </div>
                  )}
                  <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50">
                    <Link
                      href="/gettoursadmin"
                      className="text-xs font-semibold text-blue-600 hover:underline"
                      onClick={() => setNotifOpen(false)}
                    >
                      View full dashboard →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {user?.role?.replace("_", " ") || "Admin"}
            </div>
            <Link href="/" target="_blank" className="text-xs text-gray-400 hover:text-brand-blue transition-colors hidden sm:block">
              View Site &rarr;
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>

      {/* New Booking Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 bg-gray-900 text-white px-4 py-3 rounded-2xl shadow-2xl max-w-sm animate-in slide-in-from-bottom-4 duration-300">
          <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-green-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-green-400 uppercase tracking-wider">New Booking!</p>
            <p className="text-sm font-medium truncate">{toast}</p>
          </div>
          <button
            onClick={() => setToast(null)}
            className="flex-shrink-0 text-gray-400 hover:text-white p-1"
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
