"use client";

import { useEffect, useState, useCallback } from "react";
import AdminShell from "../../AdminShell";
import { getAdminEventBookings, updateEventBookingStatus, type AdminEventBooking } from "@/lib/api";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-green-100 text-green-700",
  COMPLETED: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-red-100 text-red-700",
  REFUNDED: "bg-gray-100 text-gray-700",
};

const STATUSES = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "REFUNDED"];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(iso).toLocaleDateString();
}

export default function AdminEventBookingsPage() {
  const [bookings, setBookings] = useState<AdminEventBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

  const loadBookings = useCallback(() => {
    if (!token) return;
    getAdminEventBookings(token)
      .then(setBookings)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    loadBookings();
    // auto-refresh every 30 seconds
    const interval = setInterval(loadBookings, 30000);
    return () => clearInterval(interval);
  }, [loadBookings]);

  async function handleStatusChange(id: number, currentStatus: string, newStatus: string) {
    if (!token) return;
    if (currentStatus === newStatus) return;

    const confirmed = window.confirm(
      `Are you sure you want to change this status from ${currentStatus} to ${newStatus}?`
    );
    if (!confirmed) {
      setBookings((prev) => prev.map((booking) => (booking.id === id ? { ...booking } : booking)));
      return;
    }

    setUpdatingId(id);
    try {
      await updateEventBookingStatus(id, newStatus, token);
      loadBookings();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update booking status.");
    } finally {
      setUpdatingId(null);
    }
  }

  const filtered = filter ? bookings.filter((b) => b.status === filter) : bookings;
  const latest = bookings.slice(0, 5);
  const newCount = bookings.filter((b) => {
    const created = new Date(b.created_at).getTime();
    return !Number.isNaN(created) && Date.now() - created < 86400000;
  }).length;

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-brand-navy">Event Bookings</h2>
            <p className="text-sm text-gray-500 mt-0.5">{bookings.length} total &middot; auto-refreshes every 30s</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadBookings}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Latest Bookings Panel */}
        {!loading && latest.length > 0 && (
          <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 border border-purple-100 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                <p className="text-sm font-bold text-purple-900">Latest Event Bookings</p>
                {newCount > 0 && (
                  <span className="px-2 py-0.5 bg-purple-600 text-white text-[10px] font-bold rounded-full">{newCount} new today</span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
              {latest.map((b) => {
                const isNew = Date.now() - new Date(b.created_at).getTime() < 86400000;
                return (
                  <div key={b.id} className={`bg-white rounded-xl p-3 border ${
                    isNew ? "border-purple-200 shadow-sm" : "border-gray-100"
                  }`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          {isNew && <span className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0" />}
                          <p className="text-xs font-bold text-gray-800 truncate">{b.event_title}</p>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5 truncate">{b.user_email}</p>
                      </div>
                      <span className={`flex-shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLORS[b.status] || "bg-gray-100 text-gray-600"}`}>
                        {b.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-[11px] text-gray-500">
                      <span className="font-semibold text-gray-700">USD {Number(b.total_amount).toLocaleString()}</span>
                      <span>{b.tickets} ticket{b.tickets > 1 ? "s" : ""} &middot; {timeAgo(b.created_at)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {["", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "REFUNDED"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                filter === s
                  ? "bg-brand-navy text-white border-brand-navy"
                  : "bg-white text-gray-600 border-gray-300 hover:border-brand-navy"
              }`}
            >
              {s || "All"}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-gray-200 border-t-brand-navy" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
            <p className="text-gray-500">No event bookings found.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 text-left">Ref</th>
                    <th className="px-4 py-3 text-left">Customer</th>
                    <th className="px-4 py-3 text-left">Event</th>
                    <th className="px-4 py-3 text-center">Tickets</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-left">Booked At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((b) => {
                    const customerName = b.customer_name || b.guest_name || "—";
                    const customerEmail = b.customer_email || b.guest_email || b.user_email || "—";
                    const customerPhone = b.guest_phone || "—";
                    return (
                      <tr key={b.id} className="hover:bg-gray-50 align-top">
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs font-semibold text-brand-navy">{b.booking_reference || `#${b.id}`}</span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-800 whitespace-nowrap">{customerName}</p>
                          <p className="text-xs text-gray-500 whitespace-nowrap">{customerEmail}</p>
                          <p className="text-xs text-gray-700 font-medium whitespace-nowrap flex items-center gap-1 mt-0.5">
                            <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            {customerPhone}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-gray-800">{b.event_title}</td>
                        <td className="px-4 py-3 text-center font-semibold">{b.tickets}</td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">USD {Number(b.total_amount).toLocaleString()}</td>
                        <td className="px-4 py-3 text-center">
                          <select
                            value={b.status}
                            disabled={updatingId === b.id}
                            onChange={(e) => handleStatusChange(b.id, b.status, e.target.value)}
                            className={`px-2 py-1 rounded-lg text-xs font-medium border-0 cursor-pointer focus:ring-2 focus:ring-brand-navy ${STATUS_COLORS[b.status] || "bg-gray-100 text-gray-600"} ${updatingId === b.id ? "opacity-50" : ""}`}
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                          {new Date(b.created_at).toLocaleString()}
                          {b.special_requests && (
                            <p className="mt-1 text-amber-600 italic truncate max-w-[180px]" title={b.special_requests}>📝 {b.special_requests}</p>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-3">
              {filtered.map((b) => {
                const customerName = b.customer_name || b.guest_name || "—";
                const customerEmail = b.customer_email || b.guest_email || b.user_email || "—";
                const customerPhone = b.guest_phone || "—";
                return (
                  <div key={b.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="font-mono text-xs font-bold text-brand-navy">{b.booking_reference || `#${b.id}`}</span>
                        <h3 className="font-semibold text-gray-900 text-sm mt-0.5">{b.event_title}</h3>
                      </div>
                      <select
                        value={b.status}
                        disabled={updatingId === b.id}
                        onChange={(e) => handleStatusChange(b.id, b.status, e.target.value)}
                        className={`px-2 py-1 rounded-lg text-xs font-medium border-0 cursor-pointer ${STATUS_COLORS[b.status] || "bg-gray-100"} ${updatingId === b.id ? "opacity-50" : ""}`}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-y-2 text-xs text-gray-500">
                      <span className="col-span-2">
                        <span className="font-semibold">Name:</span> <span className="text-gray-800">{customerName}</span>
                      </span>
                      <span className="col-span-2">
                        <span className="font-semibold">Email:</span> <span className="text-gray-800 break-all">{customerEmail}</span>
                      </span>
                      <span className="col-span-2">
                        <span className="font-semibold">Phone:</span> <span className="text-gray-800">{customerPhone}</span>
                      </span>
                      <span><span className="font-semibold">Tickets:</span> <span className="text-gray-700">{b.tickets}</span></span>
                      <span><span className="font-semibold">Amount:</span> <span className="text-gray-700 font-medium">USD {Number(b.total_amount).toLocaleString()}</span></span>
                      {b.special_requests && (
                        <span className="col-span-2 text-amber-600 italic">📝 {b.special_requests}</span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2">Booked: {new Date(b.created_at).toLocaleString()}</p>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </AdminShell>
  );
}
