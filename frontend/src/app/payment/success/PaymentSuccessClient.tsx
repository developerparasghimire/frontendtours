"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { jsPDF } from "jspdf";
import { useAuth } from "@/lib/auth";
import { getPaymentStatus, getGuestPaymentStatus, type PaymentStatusResponse } from "@/lib/api";

// H8: increased poll budget to ~60s. Hosted Checkout settle can sometimes take
// 30-45s on first call before MPG status returns SUCCESS / FAILED.
const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 30; // ~60s

export default function PaymentSuccessClient() {
  const params = useSearchParams();
  const { token } = useAuth();

  const orderId = params.get("order") || "";
  const bookingType = (params.get("type") || "tour").toLowerCase();
  const bookingId = params.get("booking") || "";
  // GTN-XXXX human-readable reference (from redirect)
  const bookingRef = (params.get("ref") || "").toUpperCase();

  const isGuest = !token;

  const [data, setData] = useState<PaymentStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [polling, setPolling] = useState(true);

  useEffect(() => {
    // Need either orderId+token (auth) or bookingRef (guest) to poll
    if (!orderId && !bookingRef) return;

    let cancelled = false;
    let attempts = 0;

    const tick = async () => {
      attempts += 1;
      try {
        let res: PaymentStatusResponse;
        if (!isGuest && orderId) {
          res = await getPaymentStatus(orderId, token!);
        } else if (bookingRef) {
          res = await getGuestPaymentStatus(bookingRef);
        } else {
          setPolling(false);
          return;
        }
        if (cancelled) return;
        setData(res);
        if (res.status === "SUCCESS" || res.status === "FAILED" || res.status === "CANCELLED") {
          setPolling(false);
          return;
        }
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to fetch payment status.");
      }
      if (attempts >= MAX_POLLS) {
        setPolling(false);
        return;
      }
      setTimeout(tick, POLL_INTERVAL_MS);
    };
    tick();
    return () => { cancelled = true; };
  }, [orderId, token, bookingRef, isGuest]);

  const successful = data?.status === "SUCCESS";
  const displayRef = bookingRef || (bookingId ? `#${bookingId}` : orderId || "—");

  const downloadPDF = () => {
    const doc = new jsPDF();
    // Header
    doc.setFillColor(220, 38, 38);
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Get Tours Nepal", 20, 18);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Payment Confirmation Receipt", 20, 30);

    // Booking reference box
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("BOOKING REFERENCE", 20, 56);
    doc.setFontSize(22);
    doc.setTextColor(220, 38, 38);
    doc.setFont("courier", "bold");
    doc.text(displayRef, 20, 68);

    // Details table
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    const rows: [string, string][] = [
      ["Booking Type", bookingType === "event" ? "Event Ticket" : "Tour Package"],
      ["Order ID", orderId || "—"],
      ["Status", data?.status || "—"],
    ];
    if (data) {
      rows.push(["Amount Paid", `USD ${Number(data.amount).toLocaleString()}`]);
    }
    let y = 84;
    rows.forEach(([label, value], i) => {
      if (i % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, y - 5, 182, 12, "F");
      }
      doc.setTextColor(100, 116, 139);
      doc.text(label, 20, y + 3);
      doc.setTextColor(30, 41, 59);
      doc.setFont("helvetica", "bold");
      doc.text(value, 100, y + 3);
      doc.setFont("helvetica", "normal");
      y += 14;
    });

    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text("Thank you for booking with Get Tours Nepal!", 20, y + 20);
    doc.text("Keep this receipt for your records.", 20, y + 30);

    doc.save(`GetTours_Receipt_${displayRef}.pdf`);
  };

  return (
    <section className="max-w-xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-12">
        {/* Status icon */}
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
            successful
              ? "bg-green-100 text-green-600"
              : polling
              ? "bg-yellow-100 text-yellow-700"
              : "bg-orange-100 text-orange-600"
          }`}
        >
          {successful ? (
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-10 h-10 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy mb-3">
          {successful
            ? "Payment Successful!"
            : polling
            ? "Confirming Payment…"
            : "Payment Pending"}
        </h1>

        {/* Booking reference */}
        {displayRef && displayRef !== "—" && (
          <div className="bg-gray-50 rounded-xl border border-gray-200 px-6 py-3 inline-block mb-5">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest mb-1">Booking Reference</p>
            <p className="text-2xl font-extrabold text-brand-red font-mono">{displayRef}</p>
          </div>
        )}

        {data && (
          <p className="text-gray-600 mb-4">
            Amount paid:{" "}
            <span className="font-bold text-green-600">
              USD {Number(data.amount).toLocaleString()}
            </span>
          </p>
        )}

        {!successful && polling && (
          <p className="text-sm text-gray-500 mb-5">
            Waiting for the bank to confirm your payment. This usually takes a few seconds…
          </p>
        )}

        {!successful && !polling && (
          <p className="text-sm text-yellow-700 mb-5">
            We have not received final confirmation yet. Your booking will be updated automatically once it arrives.
            {isGuest && bookingRef && (
              <> Save your reference <strong className="font-mono">{displayRef}</strong> — you can use it to check your status later.</>
            )}
          </p>
        )}

        {successful && isGuest && (
          <p className="text-sm text-gray-500 mb-5">
            A confirmation email has been sent to your email address. Save your booking reference <strong className="font-mono text-brand-red">{displayRef}</strong>.
          </p>
        )}

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
          {/* PDF download — always visible once we have a reference */}
          {(successful || !polling) && (displayRef && displayRef !== "—") && (
            <button
              onClick={downloadPDF}
              className="inline-flex items-center justify-center gap-2 bg-brand-red text-white font-bold px-6 py-3.5 rounded-xl hover:bg-red-700 transition-colors shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Receipt
            </button>
          )}

          {!isGuest && (
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center bg-brand-navy text-white font-bold px-6 py-3.5 rounded-xl hover:bg-brand-blue transition-colors shadow-lg"
            >
              View My Bookings
            </Link>
          )}

          <Link
            href={bookingType === "event" ? "/events" : "/tours"}
            className="inline-flex items-center justify-center bg-white text-brand-navy font-bold px-6 py-3.5 rounded-xl border border-gray-200 hover:border-brand-blue hover:text-brand-blue transition-colors"
          >
            Browse More
          </Link>
        </div>
      </div>
    </section>
  );
}
