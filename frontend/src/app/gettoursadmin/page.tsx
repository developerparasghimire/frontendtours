"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import AdminShell from "./AdminShell";
import {
  getAdminStats,
  getAdminRecentBookings,
  type AdminDashboardStats,
  type AdminRecentBooking,
} from "@/lib/api";

// ── helpers ──────────────────────────────────────────────────────────────────

function fmt(value: string | number | undefined, prefix = ""): string {
  if (value === undefined || value === null) return "—";
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(n)) return "—";
  return prefix + n.toLocaleString();
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const STATUS_STYLES: Record<string, string> = {
  PENDING:   "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
  REFUNDED:  "bg-gray-100 text-gray-600",
};

// ── sub-components ────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, icon, gradient, href,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: string;
  gradient: string;
  href?: string;
}) {
  const inner = (
    <div className="group relative bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-all duration-200 h-full">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1.5 leading-none">
            {value}
          </p>
          {sub && <p className="text-xs text-gray-400 mt-1.5">{sub}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
          </svg>
        </div>
      </div>
    </div>
  );
  return href ? <Link href={href} className="block h-full">{inner}</Link> : inner;
}

function AlertBadge({ count, label, href }: { count: number; label: string; href: string }) {
  if (count === 0) return null;
  return (
    <Link
      href={href}
      className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 hover:bg-amber-100 transition-colors"
    >
      <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white font-bold text-sm">
        {count > 99 ? "99+" : count}
      </span>
      <span className="text-sm font-semibold text-amber-800">{label}</span>
      <svg className="w-4 h-4 text-amber-600 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}

// ── main page ─────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [recent, setRecent] = useState<AdminRecentBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"week" | "month" | "all">("week");

  const load = useCallback(async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;
    try {
      const [s, r] = await Promise.all([
        getAdminStats(token),
        getAdminRecentBookings(token, 15),
      ]);
      setStats(s);
      setRecent(r);
    } catch {
      // handled by null check below
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <AdminShell>
        <div className="flex justify-center py-24">
          <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-gray-200 border-t-blue-600" />
        </div>
      </AdminShell>
    );
  }

  if (!stats) {
    return (
      <AdminShell>
        <div className="text-center py-24">
          <p className="text-gray-400 text-lg font-medium">Failed to load dashboard.</p>
          <p className="text-sm text-gray-400 mt-1">Make sure the backend server is running.</p>
          <button onClick={load} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">
            Retry
          </button>
        </div>
      </AdminShell>
    );
  }

  const pendingCount = (stats.pending_tour_bookings ?? 0) + (stats.pending_event_bookings ?? 0);
  const newCount = recent.filter((b) => b.is_new).length;

  const periodStats = {
    week: {
      tour_bookings: stats.tour_bookings_week ?? 0,
      event_bookings: stats.event_bookings_week ?? 0,
      tour_revenue: stats.tour_revenue_week ?? "0",
      event_revenue: stats.event_revenue_week ?? "0",
    },
    month: {
      tour_bookings: stats.tour_bookings_month ?? 0,
      event_bookings: stats.event_bookings_month ?? 0,
      tour_revenue: stats.tour_revenue_month ?? "0",
      event_revenue: stats.event_revenue_month ?? "0",
    },
    all: {
      tour_bookings: stats.tour_bookings,
      event_bookings: stats.event_bookings,
      tour_revenue: stats.tour_revenue,
      event_revenue: stats.event_revenue,
    },
  };
  const p = periodStats[view];

  return (
    <AdminShell>
      <div className="space-y-8 max-w-7xl">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">Dashboard</h2>
            <p className="text-sm text-gray-500 mt-0.5">Welcome back — here&apos;s your business snapshot.</p>
          </div>
          <button
            onClick={load}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* ── Pending Alerts ── */}
        {pendingCount > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Action Required</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <AlertBadge count={stats.pending_tour_bookings ?? 0} label="Pending tour bookings need review" href="/gettoursadmin/bookings/tours" />
              <AlertBadge count={stats.pending_event_bookings ?? 0} label="Pending event bookings need review" href="/gettoursadmin/bookings/events" />
            </div>
          </div>
        )}

        {/* ── Overview Counts ── */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Inventory</p>
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              label="Total Tours"
              value={stats.tours_count}
              icon="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              gradient="from-blue-500 to-blue-600"
              href="/gettoursadmin/tours"
            />
            <StatCard
              label="Total Events"
              value={stats.events_count}
              icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              gradient="from-purple-500 to-purple-600"
              href="/gettoursadmin/events"
            />
          </div>
        </div>

        {/* ── Period Stats ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Bookings & Revenue</p>
            <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5 text-xs font-semibold">
              {(["week", "month", "all"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setView(t)}
                  className={`px-3 py-1.5 rounded-md transition-colors ${view === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                  {t === "week" ? "This Week" : t === "month" ? "This Month" : "All Time"}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              label="Tour Bookings"
              value={p.tour_bookings}
              sub={view === "week" ? "last 7 days" : view === "month" ? "this month" : "all time"}
              icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              gradient="from-green-500 to-emerald-600"
              href="/gettoursadmin/bookings/tours"
            />
            <StatCard
              label="Event Bookings"
              value={p.event_bookings}
              sub={view === "week" ? "last 7 days" : view === "month" ? "this month" : "all time"}
              icon="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
              gradient="from-orange-500 to-orange-600"
              href="/gettoursadmin/bookings/events"
            />
            <StatCard
              label="Tour Revenue"
              value={fmt(p.tour_revenue, "$")}
              sub={view === "week" ? "last 7 days" : view === "month" ? "this month" : "all time"}
              icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              gradient="from-emerald-500 to-teal-600"
            />
            <StatCard
              label="Event Revenue"
              value={fmt(p.event_revenue, "$")}
              sub={view === "week" ? "last 7 days" : view === "month" ? "this month" : "all time"}
              icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              gradient="from-rose-500 to-pink-600"
            />
          </div>
        </div>

        {/* ── Recent Bookings ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Recent Bookings</p>
              {newCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping inline-block" />
                  {newCount} NEW
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Link href="/gettoursadmin/bookings/tours" className="text-xs font-semibold text-blue-600 hover:underline">Tour Bookings →</Link>
              <span className="text-gray-300">|</span>
              <Link href="/gettoursadmin/bookings/events" className="text-xs font-semibold text-purple-600 hover:underline">Event Bookings →</Link>
            </div>
          </div>

          {recent.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
              <p className="text-gray-400 text-sm">No bookings yet.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider px-4 py-3">Customer</th>
                      <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider px-4 py-3">Tour / Event</th>
                      <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider px-4 py-3">Type</th>
                      <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider px-4 py-3">Amount</th>
                      <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider px-4 py-3">Status</th>
                      <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider px-4 py-3">When</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recent.map((b) => (
                      <tr key={`${b.booking_type}-${b.id}`} className={`hover:bg-gray-50 transition-colors ${b.is_new ? "bg-blue-50/40" : ""}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {b.is_new && (
                              <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" title="New booking" />
                            )}
                            <span className="font-medium text-gray-800 truncate max-w-[160px]">{b.user_email}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate">{b.title}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide ${b.booking_type === "tour" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                            {b.booking_type === "tour" ? (
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                            ) : (
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                            )}
                            {b.booking_type}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900">USD {fmt(b.amount)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide ${STATUS_STYLES[b.status] || "bg-gray-100 text-gray-600"}`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                          {b.is_new && <span className="text-blue-600 font-bold mr-1">NEW · </span>}
                          {timeAgo(b.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* ── Quick Actions ── */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Quick Actions</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Add New Tour", href: "/gettoursadmin/tours", color: "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100", icon: "M12 6v6m0 0v6m0-6h6m-6 0H6" },
              { label: "Add New Event", href: "/gettoursadmin/events", color: "bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-100", icon: "M12 6v6m0 0v6m0-6h6m-6 0H6" },
              { label: "Tour Bookings", href: "/gettoursadmin/bookings/tours", color: "bg-green-50 text-green-700 hover:bg-green-100 border border-green-100", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
              { label: "Manage Blog", href: "/gettoursadmin/blog", color: "bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-100", icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" },
            ].map((a) => (
              <Link
                key={a.label}
                href={a.href}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl text-center font-semibold text-sm transition-colors ${a.color}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={a.icon} />
                </svg>
                {a.label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </AdminShell>
  );
}

