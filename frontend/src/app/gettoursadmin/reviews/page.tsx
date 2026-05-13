"use client";

import { useEffect, useState, useCallback } from "react";
import AdminShell from "../AdminShell";
import { DeleteButton } from "../components/ActionButtons";
import {
  getAdminReviews,
  updateAdminReview,
  deleteAdminReview,
  type AdminReview,
} from "@/lib/api";

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`w-4 h-4 ${s <= rating ? "text-amber-400" : "text-gray-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState("");

  const fetchReviews = useCallback(async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;
    try {
      setError("");
      const data = await getAdminReviews(token);
      setReviews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleApprove = async (id: number, approve: boolean) => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;
    setActionLoading(id);
    try {
      setError("");
      await updateAdminReview(id, { is_approved: approve }, token);
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_approved: approve } : r))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update review.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    const token = localStorage.getItem("admin_token");
    if (!token) return;
    setActionLoading(id);
    try {
      setError("");
      await deleteAdminReview(id, token);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete review.");
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = reviews.filter((r) => {
    if (filter === "pending") return !r.is_approved;
    if (filter === "approved") return r.is_approved;
    return true;
  });

  const pendingCount = reviews.filter((r) => !r.is_approved).length;
  const approvedCount = reviews.filter((r) => r.is_approved).length;

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-brand-navy">Review Moderation</h1>
            <p className="text-sm text-gray-500 mt-1">Approve or reject user reviews before they appear on tours & events</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full border border-amber-200">
              {pendingCount} Pending
            </span>
            <span className="text-xs font-medium bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-200">
              {approvedCount} Approved
            </span>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {(["all", "pending", "approved"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 capitalize ${
                filter === f
                  ? "bg-white text-brand-navy shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {f} {f === "all" ? `(${reviews.length})` : f === "pending" ? `(${pendingCount})` : `(${approvedCount})`}
            </button>
          ))}
        </div>

        {/* Reviews Table */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-[3px] border-gray-200 border-t-brand-navy mx-auto" />
            <p className="text-sm text-gray-400 mt-3">Loading reviews...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-gray-500 text-sm">No {filter === "all" ? "" : filter} reviews found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <p className="font-semibold text-brand-navy">{review.user_name}</p>
                      <span className="text-gray-300">|</span>
                      <p className="text-gray-500">{review.user_email}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-md bg-gray-100 px-2 py-1 font-medium text-gray-700">
                        {review.tour_title ? "Tour" : "Event"}
                      </span>
                      <span className="text-gray-600">{review.tour_title || review.event_title}</span>
                      {review.is_verified_booking && (
                        <span className="rounded-md bg-green-50 px-2 py-1 font-medium text-green-700">
                          Verified
                        </span>
                      )}
                    </div>

                    <StarDisplay rating={review.rating} />

                    <p className="text-sm text-gray-700 leading-relaxed">{review.comment}</p>

                    <p className="text-xs text-gray-400">
                      {new Date(review.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <span
                      className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                        review.is_approved
                          ? "bg-green-50 text-green-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {review.is_approved ? "Approved" : "Pending"}
                    </span>
                    {!review.is_approved ? (
                      <button
                        onClick={() => handleApprove(review.id, true)}
                        disabled={actionLoading === review.id}
                        className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
                      >
                        {actionLoading === review.id ? "..." : "Approve"}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleApprove(review.id, false)}
                        disabled={actionLoading === review.id}
                        className="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600 disabled:opacity-50"
                      >
                        {actionLoading === review.id ? "..." : "Unapprove"}
                      </button>
                    )}
                    <DeleteButton
                      onClick={() => handleDelete(review.id)}
                      disabled={actionLoading === review.id}
                      className="rounded-md"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
