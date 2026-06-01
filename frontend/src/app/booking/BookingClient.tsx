"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import MotionWrapper from "@/components/shared/MotionWrapper";
import type { Event, Tour } from "@/types";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { useAuth } from "@/lib/auth";
import { createEventBooking, createTourBooking, guestCreateTourBooking, guestCreateEventBooking } from "@/lib/api";
import { shouldUseUnoptimizedImage } from "@/lib/images";
import { useCurrency } from "@/context/CurrencyContext";

type SavedBooking = {
  id: number;
  booking_reference: string;
  status: string;
  totalAmount: string;
  paymentUrl: string | null;
};

function BookingContent({ tours, events }: { tours: Tour[]; events: Event[] }) {
  const searchParams = useSearchParams();
  const { user, token, isAuthenticated, loading: authLoading } = useAuth();
  const type = searchParams.get("type") || "tour"; // 'tour' | 'event'
  const id = searchParams.get("id") || searchParams.get("tour");

  const isEvent = type === "event";
  const selectedItem = isEvent
    ? events.find((event) => event.id === id) ?? events[0]
    : tours.find((tour) => tour.id === id) ?? tours[0];

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    travelers: "2",
    notes: "",
  });

  const [step, setStep] = useState(1); // 1 = form, 2 = payment, 3 = success
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [savedBooking, setSavedBooking] = useState<SavedBooking | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  // Auto-fill name and email from logged-in user
  const userName = form.name || (user ? `${user.first_name} ${user.last_name}`.trim() : "");
  const userEmail = form.email || (user ? user.email : "");

  const { formatPrice } = useCurrency();
  const travelers = parseInt(form.travelers) || 1;
  const basePriceUsd = selectedItem?.basePrice ?? (parseFloat((selectedItem?.price || "0").replace(/[^\d.]/g, "")) || 0);
  const total = basePriceUsd * travelers;
  const formatUsd = (n: number) =>
    `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })} USD`;
  const today = new Date();
  const todayIso = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];
  const eventSchedule = isEvent && selectedItem && "date" in selectedItem
    ? [selectedItem.date, selectedItem.time].filter(Boolean).join(" at ")
    : "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEvent) {
      if (!form.date) {
        setError("Please select a travel date before continuing.");
        return;
      }
      if (form.date < todayIso) {
        setError("Travel date cannot be in the past.");
        return;
      }
    }

    // Save auto-filled values
    if (!form.name && userName) setForm(f => ({ ...f, name: userName }));
    if (!form.email && userEmail) setForm(f => ({ ...f, email: userEmail }));
    setError("");
    setStep(2); // move to payment step
  };

  const handlePayment = async () => {
    if (!selectedItem?.numericId) {
      setError(`This ${isEvent ? "event" : "tour"} is missing a backend booking ID.`);
      setStep(1);
      return;
    }

    if (!isEvent && !form.date) {
      setError("Please select a travel date before completing payment.");
      setStep(1);
      return;
    }

    setSubmitting(true);
    setError("");

    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const cancelUrl = origin
      ? `${origin}/booking?type=${isEvent ? "event" : "tour"}&id=${selectedItem.id}`
      : undefined;
    const successUrl = origin ? `${origin}/payment/success` : undefined;

    const guestName = finalName;
    const guestEmail = finalEmail;
    const guestPhone = form.phone;

    // Require phone for guest bookings
    if (!token && !guestPhone.trim()) {
      setError("Phone number is required for guest bookings.");
      setSubmitting(false);
      return;
    }

    try {
      let response;
      if (token) {
        // Authenticated user booking
        response = isEvent
          ? await createEventBooking(
              { event_id: selectedItem.numericId, tickets: travelers, success_url: successUrl, cancel_url: cancelUrl, gateway: "MPG", special_requests: form.notes },
              token
            )
          : await createTourBooking(
              { tour_id: selectedItem.numericId, travel_date: form.date, persons: travelers, success_url: successUrl, cancel_url: cancelUrl, gateway: "MPG", special_requests: form.notes },
              token
            );
      } else {
        // Guest booking
        response = isEvent
          ? await guestCreateEventBooking({
              event_id: selectedItem.numericId,
              tickets: travelers,
              success_url: successUrl,
              cancel_url: cancelUrl,
              gateway: "MPG",
              guest_name: guestName,
              guest_email: guestEmail,
              guest_phone: guestPhone,
              special_requests: form.notes,
            })
          : await guestCreateTourBooking({
              tour_id: selectedItem.numericId,
              travel_date: form.date,
              persons: travelers,
              success_url: successUrl,
              cancel_url: cancelUrl,
              gateway: "MPG",
              guest_name: guestName,
              guest_email: guestEmail,
              guest_phone: guestPhone,
              special_requests: form.notes,
            });
      }

      const paymentUrl = response.payment_url || null;

      setSavedBooking({
        id: response.booking.id,
        booking_reference: response.booking.booking_reference,
        status: response.booking.status,
        totalAmount: response.booking.total_amount,
        paymentUrl,
      });

      // Hosted Checkout requires a top-level redirect to the gateway.
      if (paymentUrl) {
        window.location.assign(paymentUrl);
        return;
      }

      setStep(3);
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : "Failed to create booking.");
    } finally {
      setSubmitting(false);
    }
  };

  const finalName = form.name || userName;
  const finalEmail = form.email || userEmail;

  // Generate QR code when booking succeeds (step 3)
  useEffect(() => {
    if (step !== 3 || !savedBooking) return;
    const bookingRef = savedBooking.booking_reference || `BKN-${savedBooking.id}`;
    const qrText = [
      `Booking Reference: ${bookingRef}`,
      `Name: ${finalName}`,
      `Email: ${finalEmail}`,
      savedBooking.status ? `Status: ${savedBooking.status}` : "",
      `Item: ${selectedItem?.title || "N/A"}`,
      `Type: ${isEvent ? "Event Ticket" : "Tour Package"}`,
      `${isEvent ? "Tickets" : "Travelers"}: ${travelers}`,
      form.date ? `Date: ${form.date}` : eventSchedule ? `Event Date: ${eventSchedule}` : "",
      `Total: $${Number(savedBooking.totalAmount || total).toLocaleString()}`,
      "Currency: USD",
      "Get Tours Nepal — gettours.com.np",
    ].filter(Boolean).join("\n");

    QRCode.toDataURL(qrText, { width: 300, margin: 2, color: { dark: "#162B39", light: "#ffffff" } })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, [step, savedBooking, finalName, finalEmail, selectedItem, isEvent, travelers, form.date, eventSchedule, total]);

  const downloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `QR_${(savedBooking?.booking_reference || `BKN-${savedBooking?.id}`)}.png`;
    a.click();
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("Booking Confirmation", 20, 20);
    
    doc.setFontSize(16);
    doc.text("Get Tours Nepal", 20, 30);
    
    doc.setFontSize(12);
    doc.text(`Booking Reference: ${savedBooking?.booking_reference || `#BKN-${savedBooking?.id}`}`, 20, 45);
    doc.text(`Name: ${finalName}`, 20, 55);
    doc.text(`Email: ${finalEmail}`, 20, 65);
    doc.text(`Phone: ${form.phone}`, 20, 75);
    doc.text(`Status: ${savedBooking?.status || "PENDING"}`, 20, 85);
    
    doc.text(`Item Booked: ${selectedItem?.title || "N/A"}`, 20, 105);
    doc.text(`Type: ${isEvent ? "Event Ticket" : "Tour Package"}`, 20, 115);
    doc.text(`${isEvent ? "Tickets" : "Travelers"}: ${travelers}`, 20, 125);
    if (form.date) {
      doc.text(`Date: ${form.date}`, 20, 135);
    } else if (eventSchedule) {
      doc.text(`Event Date: ${eventSchedule}`, 20, 135);
    }
    
    doc.setFontSize(14);
    doc.text(
      `Total: $${Number(savedBooking?.totalAmount || total).toLocaleString()}`,
      20,
      155
    );
    
    doc.setFontSize(10);
    doc.text("Thank you for booking with us! Please show this slip on arrival.", 20, 175);

    doc.save(`Booking_${finalName.replace(/\s+/g, "_")}.pdf`);
  };

  if (!selectedItem) return <div className="p-20 text-center">Nothing available to book!</div>;

  // Show nothing while auth is loading (prevents flash of guest form for logged-in users)
  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-40">
        <div className="w-10 h-10 border-4 border-brand-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Guest notice — not the same as the old auth gate. We now allow booking without login.
  const isGuest = !isAuthenticated;

  return (
    <div className="flex flex-col overflow-x-hidden">
      <section className="relative h-[40vh] sm:h-[45vh] min-h-[300px] max-h-[450px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f1923] via-[#1a1510] to-[#0d1a24]" />
        {selectedItem.image && (
          <Image
            src={selectedItem.image}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
            unoptimized={shouldUseUnoptimizedImage(selectedItem.image)}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/70 via-brand-navy/60 to-brand-navy/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/56 via-transparent to-brand-navy/22" />
        <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="absolute -top-[15%] right-[10%] w-[350px] h-[350px] rounded-full bg-brand-orange/18 blur-[130px] pointer-events-none" />
        <div className="absolute -bottom-[10%] left-[5%] w-[300px] h-[300px] rounded-full bg-brand-red/12 blur-[110px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-brand-orange via-brand-red to-brand-orange" />
        <div className="relative z-10 text-center px-4 sm:px-6 pt-16 sm:pt-20">
          <span className="text-brand-orange text-sm font-bold tracking-widest uppercase inline-block">
            {step === 1 ? "Complete Your Booking" : step === 2 ? "Payment" : "Booking Confirmed!"}
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mt-3 mb-3">
            {step === 1 ? "Secure Your Spot" : step === 2 ? "Complete Payment" : "Thank You!"}
          </h1>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <MotionWrapper>
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
                {error && (
                  <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}
                
                {step === 1 && (
                <>
                  {isGuest && (
                    <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5 flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex items-center gap-2 text-amber-700">
                        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-sm font-semibold">You are booking as a guest.</span>
                      </div>
                      <p className="text-xs text-amber-600 sm:ml-1">You can book without an account. Fill in your details below, or&nbsp;
                        <Link
                          href={`/login?redirect=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname + window.location.search : "/booking")}`}
                          className="font-bold underline hover:text-amber-800"
                        >sign in</Link>
                        &nbsp;for faster checkout and booking history.
                      </p>
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-brand-navy">
                      {isGuest ? "Guest Booking Details" : "Traveler Details"}
                    </h2>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="text-sm font-bold text-brand-navy mb-1.5 block">Full Name *</label>
                        <input
                          type="text" required value={form.name || userName}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition text-brand-navy"
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-bold text-brand-navy mb-1.5 block">Email *</label>
                        <input
                          type="email" required value={form.email || userEmail}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition text-brand-navy"
                          placeholder="you@example.com"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-bold text-brand-navy mb-1.5 block">
                          Phone {isGuest && <span className="text-brand-red">*</span>}
                        </label>
                        <input
                          type="tel"
                          required={isGuest}
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition text-brand-navy"
                          placeholder="+977 98XXXXXXXX"
                        />
                      </div>
                      {!isEvent && (
                        <div>
                          <label className="text-sm font-bold text-brand-navy mb-1.5 block">Travel Date *</label>
                          <input
                            type="date"
                            min={todayIso}
                            required
                            value={form.date}
                            onChange={(e) => setForm({ ...form, date: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition text-brand-navy"
                          />
                        </div>
                      )}
                    </div>

                    {isEvent && eventSchedule && (
                      <div className="rounded-xl border border-brand-blue/15 bg-brand-blue/5 px-4 py-3 text-sm text-gray-600">
                        You are booking tickets for <span className="font-semibold text-brand-navy">{selectedItem.title}</span> on {eventSchedule}.
                      </div>
                    )}

                    <div>
                      <label className="text-sm font-bold text-brand-navy mb-1.5 block">Number of {isEvent ? 'Tickets' : 'Travelers'} *</label>
                      <select
                        value={form.travelers}
                        onChange={(e) => setForm({ ...form, travelers: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition appearance-none bg-white text-brand-navy"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <option key={num} value={num}>{num} {isEvent ? 'Ticket' : 'Person'}{num > 1 ? "s" : ""}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-bold text-brand-navy mb-1.5 block">Special Requests</label>
                      <textarea
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition resize-none text-brand-navy"
                        rows={4}
                        placeholder="Dietary needs, accessibility requirements, special occasions..."
                      />
                    </div>

                    <button type="submit" className="w-full bg-brand-red text-white font-bold py-4 rounded-xl text-lg hover:bg-red-700 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.98]">
                      Proceed to Payment &rarr;
                    </button>
                  </form>
                </>
                )}

                {step === 2 && (
                  <div className="text-center py-10">
                    <h2 className="text-2xl font-bold text-brand-navy mb-4">Confirm Your Booking</h2>
                    <p className="text-gray-600 mb-6">Please review your total: <strong className="text-brand-green">{formatPrice(total)}</strong></p>

                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8 max-w-sm mx-auto text-left space-y-3">
                       <div className="flex justify-between text-sm">
                         <span className="text-gray-500">{isEvent ? "Event" : "Tour"}</span>
                         <span className="font-semibold text-brand-navy">{selectedItem.title}</span>
                       </div>
                       <div className="flex justify-between text-sm">
                         <span className="text-gray-500">{isEvent ? "Tickets" : "Travelers"}</span>
                         <span className="font-semibold text-brand-navy">{travelers}</span>
                       </div>
                       {!isEvent && form.date && (
                         <div className="flex justify-between text-sm">
                           <span className="text-gray-500">Travel Date</span>
                           <span className="font-semibold text-brand-navy">{form.date}</span>
                         </div>
                       )}
                       <div className="border-t border-gray-200 pt-3 flex justify-between">
                         <span className="font-bold text-brand-navy">Total Amount</span>
                         <span className="font-extrabold text-brand-green">{formatPrice(total)}</span>
                       </div>
                       <p className="text-xs text-gray-400 pt-2">You will be redirected to the secure Mastercard payment page to complete your purchase.</p>
                    </div>

                    <button
                      onClick={handlePayment}
                      disabled={submitting}
                      className={`w-full max-w-sm mx-auto bg-brand-navy text-white font-bold py-4 rounded-xl text-lg transition-all duration-300 shadow-md ${
                        submitting ? "opacity-60 cursor-not-allowed" : "hover:bg-brand-blue"
                      }`}
                    >
                      {submitting ? "Redirecting to Payment…" : `Pay Securely ${formatPrice(total)}`}
                    </button>

                    <button
                      onClick={() => {
                        setError("");
                        setStep(1);
                      }}
                      className="mt-4 text-gray-500 text-sm hover:underline"
                    >
                      &larr; Back to Details
                    </button>
                  </div>
                )}

                {step === 3 && (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy mb-4">Booking Confirmed!</h2>
                    <p className="text-gray-600 mb-4 max-w-md mx-auto">
                      Your booking for <strong>{selectedItem.title}</strong> was created successfully.
                    </p>
                    <div className="bg-gray-50 rounded-xl border border-gray-200 px-6 py-3 inline-block mb-6">
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest mb-1">Booking Reference</p>
                      <p className="text-2xl font-extrabold text-brand-red font-mono">{savedBooking?.booking_reference || `#${savedBooking?.id}`}</p>
                    </div>

                    {/* QR Code Section */}
                    <div className="flex flex-col items-center mb-8">
                      <p className="text-sm font-semibold text-brand-navy mb-3">Your Booking QR Code</p>
                      <p className="text-xs text-gray-500 mb-4 max-w-xs">Scan or download this QR code — it contains all your booking details. Show it on arrival.</p>
                      {qrDataUrl ? (
                        <div className="border-2 border-dashed border-brand-navy/20 rounded-2xl p-3 bg-white shadow-md">
                          <Image src={qrDataUrl} alt="Booking QR Code" width={220} height={220} unoptimized className="rounded-xl" />
                        </div>
                      ) : (
                        <div className="w-[220px] h-[220px] border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center">
                          <div className="w-8 h-8 border-2 border-brand-navy border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-gray-500 mb-8">
                      Status: <span className="font-semibold text-brand-navy">{savedBooking?.status || "PENDING"}</span>
                    </p>
                    
                    <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center">
                      {qrDataUrl && (
                        <button onClick={downloadQR} className="inline-flex items-center justify-center gap-2 bg-brand-navy text-white font-bold px-6 py-3.5 rounded-xl hover:bg-brand-blue transition-colors shadow-lg">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download QR Code
                        </button>
                      )}
                      <button onClick={generatePDF} className="inline-flex items-center justify-center gap-2 bg-brand-red text-white font-bold px-6 py-3.5 rounded-xl hover:bg-red-700 transition-colors shadow-lg">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download PDF Ticket
                      </button>
                      {savedBooking?.paymentUrl && (
                        <a
                          href={savedBooking.paymentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center gap-2 bg-white text-brand-navy font-bold px-6 py-3.5 rounded-xl border border-gray-200 hover:border-brand-blue hover:text-brand-blue transition-colors shadow-sm"
                        >
                          Open Payment Link
                        </a>
                      )}
                      <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 bg-green-600 text-white font-bold px-6 py-3.5 rounded-xl hover:bg-green-700 transition-colors shadow-lg">
                        View My Bookings
                      </Link>
                    </div>
                    <canvas ref={qrCanvasRef} className="hidden" />
                  </div>
                )}

              </div>
            </MotionWrapper>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 sm:top-24 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="relative h-40 sm:h-48">
                {selectedItem.image ? (
                  <Image
                    src={selectedItem.image}
                    alt={selectedItem.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 420px"
                    unoptimized={shouldUseUnoptimizedImage(selectedItem.image)}
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-navy to-brand-blue" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>

              <div className="p-4 sm:p-6 space-y-4">
                <h3 className="text-base sm:text-lg font-bold text-brand-navy">{selectedItem.title}</h3>
                
                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                  {selectedItem.location && (
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                      {selectedItem.location}
                    </span>
                  )}
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{isEvent ? 'Ticket Price' : 'Price per person'}</span>
                    <span className="font-semibold text-brand-navy">{formatPrice(basePriceUsd)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{isEvent ? 'Tickets' : 'Travelers'}</span>
                    <span className="font-semibold text-brand-navy">{travelers}</span>
                  </div>
                  <div className="border-t border-gray-100 pt-2 flex justify-between">
                    <span className="font-bold text-brand-navy">Total</span>
                    <span className="font-extrabold text-brand-green text-lg sm:text-xl">{formatPrice(total)}</span>
                  </div>
                </div>

                <Link
                  href={`/${isEvent ? 'events' : 'tours'}/${selectedItem.id}`}
                  className="block text-center text-brand-blue text-sm font-semibold hover:text-brand-navy transition-colors pt-2"
                >
                  View Full Details &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function BookingClient({ tours, events }: { tours: Tour[]; events: Event[] }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><span className="text-gray-400">Loading...</span></div>}>
      <BookingContent tours={tours} events={events} />
    </Suspense>
  );
}
