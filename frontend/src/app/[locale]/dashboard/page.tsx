"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth";
import { getMyTourBookings, getMyEventBookings, changePassword, type MyTourBooking, type MyEventBooking } from "@/lib/api";
import { shouldUseUnoptimizedImage } from "@/lib/images";

const statusConfig: Record<string, { bg: string; text: string; dot: string; bar: string; label: string }> = {
  PENDING:   { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-400",   bar: "bg-amber-400",   label: "Pending" },
  CONFIRMED: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500",  bar: "bg-emerald-500", label: "Confirmed" },
  COMPLETED: { bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-500",     bar: "bg-blue-500",    label: "Completed" },
  CANCELLED: { bg: "bg-red-50",     text: "text-red-600",     dot: "bg-red-400",      bar: "bg-red-400",     label: "Cancelled" },
  REFUNDED:  { bg: "bg-gray-100",   text: "text-gray-500",    dot: "bg-gray-400",     bar: "bg-gray-400",    label: "Refunded" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] || statusConfig.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatAmount(amount: string) {
  return `$${parseFloat(amount).toLocaleString()} USD`;
}

function TourBookingCard({ booking }: { booking: MyTourBooking }) {
  const cfg = statusConfig[booking.status] || statusConfig.PENDING;
  return (
    <Link
      href={booking.tour_slug ? `/tours/${booking.tour_slug}` : "#"}
      className="group flex gap-0 bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-200"
    >
      <div className={`w-1 shrink-0 ${cfg.bar}`} />
      <div className="w-24 sm:w-32 shrink-0 relative bg-gray-100 min-h-[96px]">
        {booking.tour_image ? (
          <Image src={booking.tour_image} alt={booking.tour_title || "Tour"} fill className="object-cover" sizes="128px" unoptimized={shouldUseUnoptimizedImage(booking.tour_image)} />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-navy/80 to-brand-blue/60 flex items-center justify-center">
            <svg className="w-8 h-8 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
      </div>
      <div className="flex-1 p-4 sm:p-5 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="min-w-0">
            <h3 className="font-bold text-brand-navy text-sm sm:text-base leading-snug group-hover:text-brand-red transition-colors truncate">
              {booking.tour_title || `Tour #${booking.tour}`}
            </h3>
            {booking.tour_destination && (
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                {booking.tour_destination}
              </p>
            )}
          </div>
          <StatusBadge status={booking.status} />
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-brand-blue shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <span className="font-semibold text-brand-navy">{formatDate(booking.travel_date)}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-brand-blue shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {booking.persons} {booking.persons === 1 ? "Person" : "People"}
          </span>
          <span className="text-gray-300 hidden sm:inline">·</span>
          <span className="text-gray-400 hidden sm:inline">Ref #{booking.id}</span>
          <span className="sm:hidden text-lg font-extrabold text-brand-green">{formatAmount(booking.total_amount)}</span>
        </div>
      </div>
      <div className="hidden sm:flex flex-col items-end justify-center px-5 shrink-0 border-l border-gray-100">
        <p className="text-lg font-extrabold text-brand-green whitespace-nowrap">{formatAmount(booking.total_amount)}</p>
        <p className="text-[10px] text-gray-400 mt-0.5">Booked {formatDate(booking.created_at)}</p>
      </div>
    </Link>
  );
}

function EventBookingCard({ booking }: { booking: MyEventBooking }) {
  const cfg = statusConfig[booking.status] || statusConfig.PENDING;
  return (
    <Link
      href={booking.event_slug ? `/events/${booking.event_slug}` : "#"}
      className="group flex gap-0 bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-200"
    >
      <div className={`w-1 shrink-0 ${cfg.bar}`} />
      <div className="w-24 sm:w-32 shrink-0 relative bg-gray-100 min-h-[96px]">
        {booking.event_image ? (
          <Image src={booking.event_image} alt={booking.event_title || "Event"} fill className="object-cover" sizes="128px" unoptimized={shouldUseUnoptimizedImage(booking.event_image)} />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/80 to-brand-navy/60 flex items-center justify-center">
            <svg className="w-8 h-8 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
      </div>
      <div className="flex-1 p-4 sm:p-5 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="min-w-0">
            <h3 className="font-bold text-brand-navy text-sm sm:text-base leading-snug group-hover:text-brand-blue transition-colors truncate">
              {booking.event_title || `Event #${booking.event}`}
            </h3>
            {booking.event_venue && (
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                {booking.event_venue}
              </p>
            )}
          </div>
          <StatusBadge status={booking.status} />
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500">
          {booking.event_date && (
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-brand-blue shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <span className="font-semibold text-brand-navy">{formatDate(booking.event_date)}</span>
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-brand-blue shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
            {booking.tickets} {booking.tickets === 1 ? "Ticket" : "Tickets"}
          </span>
          <span className="text-gray-300 hidden sm:inline">·</span>
          <span className="text-gray-400 hidden sm:inline">Ref #{booking.id}</span>
          <span className="sm:hidden text-lg font-extrabold text-brand-green">{formatAmount(booking.total_amount)}</span>
        </div>
      </div>
      <div className="hidden sm:flex flex-col items-end justify-center px-5 shrink-0 border-l border-gray-100">
        <p className="text-lg font-extrabold text-brand-green whitespace-nowrap">{formatAmount(booking.total_amount)}</p>
        <p className="text-[10px] text-gray-400 mt-0.5">Booked {formatDate(booking.created_at)}</p>
      </div>
    </Link>
  );
}

function EmptyState({ title, description, href, cta, color, icon }: {
  title: string; description: string; href: string; cta: string; color: string; icon: string;
}) {
  return (
    <div className="text-center py-14">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
      </div>
      <h3 className="font-bold text-brand-navy text-base mb-2">{title}</h3>
      <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">{description}</p>
      <Link href={href} className={`inline-flex items-center gap-2 ${color} text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors shadow-md`}>
        {cta}
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}

export default function DashboardPage() {
  const { user, token, isAuthenticated, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"tours" | "events">("tours");
  const [tourBookings, setTourBookings] = useState<MyTourBooking[]>([]);
  const [eventBookings, setEventBookings] = useState<MyEventBooking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  // Change password state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [cpForm, setCpForm] = useState({ old_password: "", new_password: "", confirm_password: "" });
  const [cpLoading, setCpLoading] = useState(false);
  const [cpError, setCpError] = useState("");
  const [cpSuccess, setCpSuccess] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/dashboard");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (token) {
      setLoadingBookings(true);
      Promise.all([
        getMyTourBookings(token).catch(() => []),
        getMyEventBookings(token).catch(() => []),
      ]).then(([tours, events]) => {
        setTourBookings(tours);
        setEventBookings(events);
        setLoadingBookings(false);
      });
    }
  }, [token]);

  if (authLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin w-8 h-8 text-brand-red" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-gray-500 text-sm">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  const userInitials = `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase() || user.username[0].toUpperCase();
  const totalBookings = tourBookings.length + eventBookings.length;
  const completedBookings = [...tourBookings, ...eventBookings].filter(b => b.status === "COMPLETED").length;
  const totalSpent = [...tourBookings, ...eventBookings]
    .filter(b => b.status !== "CANCELLED" && b.status !== "REFUNDED")
    .reduce((sum, b) => sum + parseFloat(b.total_amount || "0"), 0);

  const stats = [
    { label: "Total Bookings", display: totalBookings.toString(), from: "from-blue-500", to: "to-indigo-600", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
    { label: "Completed", display: completedBookings.toString(), from: "from-emerald-500", to: "to-teal-600", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
    { label: "Tour Bookings", display: tourBookings.length.toString(), from: "from-violet-500", to: "to-purple-600", icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" },
    { label: "Total Spent", display: `$${totalSpent.toLocaleString()} USD`, from: "from-orange-500", to: "to-amber-500", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  ];

  return (
    <div className="min-h-screen bg-[#f4f6f9] pt-24 sm:pt-28 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Profile Hero */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="relative h-36 sm:h-44 bg-gradient-to-r from-[#1D2521] via-[#1b3a5c] to-[#339AAC]">
            <div className="absolute inset-0 bg-[url('/img/landscape_background_small.jpg')] bg-cover bg-center" />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/70 via-brand-navy/60 to-brand-navy/70" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/56 via-transparent to-brand-navy/22" />
            <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 40" preserveAspectRatio="none" fill="white">
              <path d="M0,40 L0,20 Q360,0 720,20 Q1080,40 1440,20 L1440,40 Z" />
            </svg>
          </div>
          <div className="px-6 sm:px-8 pb-6 -mt-8 relative">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 flex-wrap">
              <div className="flex items-end gap-4">
                <div className="relative">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-brand-red to-orange-500 flex items-center justify-center text-white font-black text-2xl sm:text-3xl shadow-xl border-4 border-white select-none">
                    {userInitials}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full" />
                </div>
                <div className="pb-1">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-extrabold text-brand-navy leading-tight">
                      {user.first_name} {user.last_name}
                    </h1>
                    <span className="inline-flex items-center gap-1 bg-brand-navy/10 text-brand-navy text-[10px] font-bold px-2 py-0.5 rounded-full">
                      <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      Member
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs mt-0.5">@{user.username}</p>
                </div>
              </div>
              <div className="flex gap-2 pb-1 flex-wrap sm:flex-nowrap">
                <Link
                  href="/tours"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-red text-white font-semibold rounded-xl text-sm hover:bg-red-700 transition-colors shadow-md flex-1 sm:flex-none justify-center"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Book a Tour
                </Link>
                <button
                  onClick={() => setShowChangePassword(!showChangePassword)}
                  className="inline-flex items-center gap-2 px-3 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-200 transition-colors"
                  title="Change Password"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                  <span className="hidden sm:inline">Change Password</span>
                </button>
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-2 px-3 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-200 transition-colors"
                  title="Sign Out"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className={`h-1.5 bg-gradient-to-r ${s.from} ${s.to}`} />
              <div className="p-5">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.from} ${s.to} flex items-center justify-center mb-3 shadow-sm`}>
                  <svg className="w-[18px] h-[18px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                  </svg>
                </div>
                <p className="text-xl sm:text-2xl font-extrabold text-brand-navy leading-none break-all">{s.display}</p>
                <p className="text-gray-400 text-xs mt-1.5 font-medium">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Change Password Panel */}
        {showChangePassword && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 sm:px-8 pt-6 pb-2">
              <h2 className="text-lg font-bold text-brand-navy flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                Change Password
              </h2>
            </div>
            <div className="h-px bg-gray-100" />
            <div className="p-6 sm:p-8">
              {cpSuccess && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">{cpSuccess}</div>
              )}
              {cpError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{cpError}</div>
              )}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setCpError("");
                  setCpSuccess("");

                  if (cpForm.new_password !== cpForm.confirm_password) {
                    setCpError("New passwords do not match.");
                    return;
                  }
                  if (cpForm.new_password.length < 8) {
                    setCpError("Password must be at least 8 characters.");
                    return;
                  }
                  if (!/[A-Z]/.test(cpForm.new_password)) {
                    setCpError("Password must contain at least one uppercase letter.");
                    return;
                  }
                  if (!/[a-z]/.test(cpForm.new_password)) {
                    setCpError("Password must contain at least one lowercase letter.");
                    return;
                  }
                  if (!/\d/.test(cpForm.new_password)) {
                    setCpError("Password must contain at least one digit.");
                    return;
                  }
                  if (!/[!@#$%^&*(),.?":{}|<>]/.test(cpForm.new_password)) {
                    setCpError("Password must contain at least one special character.");
                    return;
                  }

                  setCpLoading(true);
                  try {
                    await changePassword(cpForm.old_password, cpForm.new_password, token!);
                    setCpSuccess("Password changed successfully!");
                    setCpForm({ old_password: "", new_password: "", confirm_password: "" });
                  } catch (err: unknown) {
                    const msg = err instanceof Error ? err.message : "";
                    setCpError(msg || "Failed to change password. Please try again.");
                  } finally {
                    setCpLoading(false);
                  }
                }}
                className="space-y-4 max-w-md"
              >
                <div>
                  <label className="block text-sm font-semibold text-brand-navy mb-1.5">Current Password</label>
                  <input
                    type="password"
                    required
                    value={cpForm.old_password}
                    onChange={(e) => setCpForm({ ...cpForm, old_password: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition text-brand-navy placeholder-gray-400"
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-brand-navy mb-1.5">New Password</label>
                  <input
                    type="password"
                    required
                    value={cpForm.new_password}
                    onChange={(e) => setCpForm({ ...cpForm, new_password: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition text-brand-navy placeholder-gray-400"
                    placeholder="Min 8 chars, uppercase, lowercase, digit, special"
                    minLength={8}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-brand-navy mb-1.5">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={cpForm.confirm_password}
                    onChange={(e) => setCpForm({ ...cpForm, confirm_password: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition text-brand-navy placeholder-gray-400"
                    placeholder="Re-enter new password"
                    minLength={8}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={cpLoading}
                    className="px-6 py-2.5 bg-brand-red text-white font-semibold rounded-xl text-sm hover:bg-red-700 transition-colors shadow-md disabled:opacity-50"
                  >
                    {cpLoading ? "Changing..." : "Change Password"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowChangePassword(false); setCpError(""); setCpSuccess(""); setCpForm({ old_password: "", new_password: "", confirm_password: "" }); }}
                    className="px-6 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bookings */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 sm:px-8 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-brand-navy">My Bookings</h2>
              {totalBookings > 0 && (
                <span className="text-xs text-gray-400 font-medium">{totalBookings} total</span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("tours")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === "tours" ? "bg-brand-navy text-white shadow-sm" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                Tours
                <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${activeTab === "tours" ? "bg-white/20 text-white" : "bg-gray-200 text-gray-500"}`}>{tourBookings.length}</span>
              </button>
              <button
                onClick={() => setActiveTab("events")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === "events" ? "bg-brand-navy text-white shadow-sm" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                Events
                <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${activeTab === "events" ? "bg-white/20 text-white" : "bg-gray-200 text-gray-500"}`}>{eventBookings.length}</span>
              </button>
            </div>
          </div>
          <div className="h-px bg-gray-100 mt-4" />
          <div className="p-6 sm:p-8">
            {loadingBookings ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <svg className="animate-spin w-8 h-8 text-brand-red" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-gray-400 text-sm">Loading bookings…</p>
              </div>
            ) : activeTab === "tours" ? (
              tourBookings.length > 0 ? (
                <div className="space-y-3">
                  {tourBookings.map((b) => <TourBookingCard key={b.id} booking={b} />)}
                </div>
              ) : (
                <EmptyState
                  title="No Tour Bookings Yet"
                  description="You haven't booked any tours yet. Explore our amazing Nepal packages!"
                  href="/tours"
                  cta="Explore Tours"
                  color="bg-brand-red hover:bg-red-700"
                  icon="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
              )
            ) : (
              eventBookings.length > 0 ? (
                <div className="space-y-3">
                  {eventBookings.map((b) => <EventBookingCard key={b.id} booking={b} />)}
                </div>
              ) : (
                <EmptyState
                  title="No Event Bookings Yet"
                  description="You haven't booked any events yet. Check out upcoming Nepal experiences!"
                  href="/events"
                  cta="Explore Events"
                  color="bg-brand-blue hover:bg-brand-navy"
                  icon="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                />
              )
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Browse Tours", sub: "Find your next adventure", href: "/tours", from: "from-brand-red/10", icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z", iconColor: "text-brand-red" },
            { label: "Upcoming Events", sub: "Culture, music & more", href: "/events", from: "from-brand-blue/10", icon: "M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z", iconColor: "text-brand-blue" },
            { label: "Read Our Blog", sub: "Travel tips & guides", href: "/blog", from: "from-emerald-500/10", icon: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z", iconColor: "text-emerald-600" },
          ].map((a) => (
            <Link
              key={a.label}
              href={a.href}
              className={`flex items-center gap-4 bg-gradient-to-br ${a.from} to-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-all duration-200 group`}
            >
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0">
                <svg className={`w-5 h-5 ${a.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={a.icon} />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-brand-navy text-sm group-hover:text-brand-red transition-colors">{a.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{a.sub}</p>
              </div>
              <svg className="w-4 h-4 text-gray-300 group-hover:text-brand-red group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
