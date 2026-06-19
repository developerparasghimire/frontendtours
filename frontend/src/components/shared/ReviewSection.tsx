"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { useTranslation } from "@/context/TranslationContext";
import {
  getTourReviews,
  getEventReviews,
  createReview,
  checkBookingStatus,
  type ReviewData,
} from "@/lib/api";

/* ── Star Rating Input ── */
function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
  size?: "sm" | "md";
}) {
  const [hover, setHover] = useState(0);
  const dim = size === "sm" ? "w-4 h-4" : "w-6 h-6";

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={`${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"} transition-transform duration-150`}
        >
          <svg
            className={`${dim} ${
              star <= (hover || value) ? "text-amber-400" : "text-gray-200"
            } transition-colors duration-200`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

/* ── Single Review Card ── */
function ReviewCard({ review }: { review: ReviewData }) {
  const date = new Date(review.created_at);
  const formattedDate = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-4 border-b border-gray-100 last:border-b-0"
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="w-7 h-7 rounded-full bg-brand-navy/10 flex items-center justify-center text-brand-navy font-bold text-xs shrink-0">
          {review.user_name.charAt(0).toUpperCase()}
        </span>
        <span className="font-semibold text-brand-navy text-sm">{review.user_name}</span>
        <span className="text-gray-300 text-xs">·</span>
        <span className="text-gray-400 text-xs">{formattedDate}</span>
        {review.is_verified_booking && (
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">✓ Verified</span>
        )}
      </div>
      <div className="flex items-center gap-2 mb-1 pl-9">
        <StarRating value={review.rating} readonly size="sm" />
      </div>
      <p className="text-gray-500 text-sm leading-relaxed pl-9">{review.comment}</p>
    </motion.div>
  );
}

/* ── Review Form ── */
function ReviewForm({
  onSubmit,
  isSubmitting,
  serverError,
}: {
  onSubmit: (rating: number, comment: string) => Promise<void>;
  isSubmitting: boolean;
  serverError?: string;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (rating === 0) {
      setError(t("review.rating_required"));
      return;
    }
    if (comment.trim().length < 10) {
      setError(t("review.min_chars"));
      return;
    }
    await onSubmit(rating, comment.trim());
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4"
    >
      <h4 className="font-bold text-brand-navy text-base">{t("review.write")}</h4>

      <div>
        <label className="text-sm text-gray-600 mb-1.5 block">{t("review.your_rating")}</label>
        <StarRating value={rating} onChange={setRating} />
      </div>

      <div>
        <label className="text-sm text-gray-600 mb-1.5 block">{t("review.your_review")}</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t("review.placeholder")}
          rows={4}
          maxLength={2000}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue/50 resize-none transition-all duration-200"
        />
        <p className="text-xs text-gray-400 mt-1">{comment.length}/2000</p>
      </div>

      {(error || serverError) && (
        <p className="text-sm text-brand-red">{error || serverError}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-brand-red text-white font-semibold px-6 py-3 rounded-xl text-sm hover:bg-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? t("review.submitting") : t("review.submit")}
      </button>
    </motion.form>
  );
}

/* ── Main Review Section ── */
export default function ReviewSection({
  tourId,
  eventId,
}: {
  tourId?: number;
  eventId?: number;
}) {
  const { user, token, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasBooking, setHasBooking] = useState(false);
  const [hasReview, setHasReview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Fetch reviews
  useEffect(() => {
    async function fetchReviews() {
      try {
        const data = tourId
          ? await getTourReviews(tourId)
          : eventId
          ? await getEventReviews(eventId)
          : [];
        setReviews(data);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, [tourId, eventId]);

  // Check booking status for authenticated users
  useEffect(() => {
    async function checkStatus() {
      if (!isAuthenticated || !token) return;
      try {
        const params = tourId ? { tour_id: tourId } : eventId ? { event_id: eventId } : null;
        if (!params) return;
        const result = await checkBookingStatus(params, token);
        setHasBooking(result.has_booking);
        setHasReview(result.has_review);
      } catch {
        // silently fail
      }
    }
    checkStatus();
  }, [isAuthenticated, token, tourId, eventId]);

  const handleSubmit = useCallback(
    async (rating: number, comment: string) => {
      if (!token) return;
      setSubmitError("");
      setIsSubmitting(true);
      try {
        const data = tourId
          ? { tour_id: tourId, rating, comment }
          : { event_id: eventId, rating, comment };
        const newReview = await createReview(data, token);
        setReviews((prev) => [newReview, ...prev]);
        setHasReview(true);
        setSubmitSuccess(true);
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : "Failed to submit review.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [token, tourId, eventId]
  );

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-brand-navy">
            {t("review.title")}{" "}
            {reviews.length > 0 && (
              <span className="text-gray-400 text-base font-normal">({reviews.length})</span>
            )}
          </h2>
          {avgRating && (
            <div className="flex items-center gap-2 mt-1">
              <StarRating value={Math.round(Number(avgRating))} readonly size="sm" />
              <span className="text-sm text-gray-500">{avgRating} {t("review.average")}</span>
            </div>
          )}
        </div>
      </div>

      {/* Write Review Section */}
      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          <motion.div
            key="login-prompt"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100"
          >
            <p className="text-gray-600 text-sm">
              <a href="/dashboard" className="text-brand-blue font-semibold hover:underline">
                {t("review.sign_in")}
              </a>{" "}
              {t("review.sign_in_msg")}
            </p>
          </motion.div>
        ) : submitSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-brand-green/5 rounded-2xl p-6 text-center border border-brand-green/20"
          >
            <svg className="w-8 h-8 text-brand-green mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-brand-green font-semibold text-sm">
              {t("review.success")}
            </p>
          </motion.div>
        ) : hasReview ? (
          <motion.div
            key="already-reviewed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-brand-blue/5 rounded-2xl p-5 border border-brand-blue/10"
          >
            <p className="text-brand-blue text-sm font-medium">
              {tourId ? t("review.already_tour") : t("review.already_event")}
            </p>
          </motion.div>
        ) : hasBooking ? (
          <ReviewForm
            key="form"
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            serverError={submitError}
          />
        ) : (
          <motion.div
            key="no-booking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-brand-orange/5 rounded-2xl p-5 border border-brand-orange/10"
          >
            <p className="text-gray-600 text-sm">
              <span className="text-brand-orange font-semibold">
                {tourId ? t("review.no_booking_tour") : t("review.no_booking_event")}
              </span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      {loading ? (
        <div className="divide-y divide-gray-100">
          {[1, 2, 3].map((i) => (
            <div key={i} className="py-4 animate-pulse">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-gray-200" />
                <div className="h-3 w-24 bg-gray-200 rounded" />
                <div className="h-2 w-16 bg-gray-200 rounded" />
              </div>
              <div className="h-3 w-full bg-gray-200 rounded mb-1.5 ml-9" />
              <div className="h-3 w-2/3 bg-gray-200 rounded ml-9" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400 text-sm">{t("review.none")}</p>
        </div>
      ) : (
        <motion.div
          className="divide-y divide-gray-100"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08 } },
          }}
        >
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </motion.div>
      )}
    </section>
  );
}
