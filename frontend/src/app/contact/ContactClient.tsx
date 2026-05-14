"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import MotionWrapper, { StaggerContainer, StaggerItem } from "@/components/shared/MotionWrapper";
import PageHero from "@/components/sections/PageHero";
import { submitContact, getSiteConfig, type SiteConfig } from "@/lib/api";
import { sectionImages } from "@/lib/sectionImages";


export default function ContactClient() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [config, setConfig] = useState<Partial<SiteConfig>>({});

  useEffect(() => {
    getSiteConfig()
      .then((c) => setConfig(c || {}))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await submitContact(formData);
      setSubmitted(true);
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const phone = (config.phone || "").trim();
  const email = (config.email || "").trim();
  const address = (config.address || "").trim();
  const addressLines = useMemo(() => address.split(/\r?\n|,\s*/).map((l) => l.trim()).filter(Boolean), [address]);
  const phoneLines = useMemo(() => phone.split(/\r?\n|,\s*/).map((l) => l.trim()).filter(Boolean), [phone]);
  const emailLines = useMemo(() => email.split(/\r?\n|,\s*/).map((l) => l.trim()).filter(Boolean), [email]);

  const MAP_EMBED_SRC = "https://maps.google.com/maps?q=27.7178371,85.3065572&z=17&ie=UTF8&iwloc=&output=embed";
  const MAP_OPEN_URL = "https://www.google.com/maps/place/Golden+Era+Travels+and+Tours/@27.7178418,85.3019438,17z";
  const mapOpenUrl = address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : MAP_OPEN_URL;

  const infoCards = [
    {
      icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z",
      icon2: "M15 11a3 3 0 11-6 0 3 3 0 016 0z",
      title: "Visit Us",
      lines: addressLines.length > 0 ? addressLines : ["Address not set yet."],
      href: mapOpenUrl,
    },
    {
      icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
      title: "Email Us",
      lines: emailLines.length > 0 ? emailLines : ["Email not set yet."],
      href: emailLines[0] ? `mailto:${emailLines[0]}` : null,
    },
    {
      icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
      title: "Call Us",
      lines: phoneLines.length > 0 ? phoneLines : ["Phone not set yet."],
      href: phoneLines[0] ? `tel:${phoneLines[0].replace(/\s+/g, "")}` : null,
    },
  ];

  return (
    <div className="flex flex-col overflow-x-hidden">
      {/* ═══════════ HERO ═══════════ */}
      <PageHero
        title="Contact Us"
        subtitle="Let's Talk"
        description="Have a question, want a custom itinerary, or ready to book? We'd love to hear from you."
        accentColor="brand-blue"
        backgroundImage={sectionImages.contactCta}
        compact
      />

      {/* ═══════════ CONTACT SECTION ═══════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 sm:gap-12 lg:gap-16">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-8">
            <MotionWrapper variant="fade-left">
              <h2 className="text-2xl font-bold text-brand-navy mb-6">Get In Touch</h2>
              <p className="text-gray-700 leading-relaxed">
                Whether you need help choosing a tour, planning a custom trip, or have any
                questions, our team is ready to assist you.
              </p>
              <div className="mt-4 rounded-xl border border-brand-blue/20 bg-brand-blue/5 px-4 py-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-brand-blue mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-brand-navy">
                  <span className="font-bold">Want to book a tour or event?</span> Fill out the form below or reach out to us directly — we&apos;ll arrange everything for you.
                </p>
              </div>
            </MotionWrapper>

            {/* Info Cards */}
            <StaggerContainer className="space-y-4" staggerDelay={0.1}>
              {infoCards.map((info) => {
                const cardInner = (
                  <div
                    className="flex items-start gap-3 sm:gap-4 p-5 sm:p-6 rounded-2xl bg-white/90 backdrop-blur-xl hover:bg-white hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.1)] transition-all duration-500 border border-gray-100/50 hover:-translate-y-1"
                  >
                    <div className="w-12 h-12 bg-brand-navy/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-brand-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={info.icon} />
                        {info.icon2 && <path strokeLinecap="round" strokeLinejoin="round" d={info.icon2} />}
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-brand-navy mb-1">{info.title}</h3>
                      {info.lines.map((line) => (
                        <p key={line} className="text-gray-700 text-sm break-words">{line}</p>
                      ))}
                    </div>
                  </div>
                );
                return (
                  <StaggerItem key={info.title}>
                    {info.href ? (
                      <a href={info.href} target={info.href.startsWith("http") ? "_blank" : undefined} rel={info.href.startsWith("http") ? "noopener noreferrer" : undefined} className="block">
                        {cardInner}
                      </a>
                    ) : cardInner}
                  </StaggerItem>
                );
              })}
            </StaggerContainer>

          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <MotionWrapper variant="fade-right">
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_-6px_rgba(0,0,0,0.08)] border border-gray-100/50 p-5 sm:p-8 md:p-10">
              <h2 className="text-xl sm:text-2xl font-bold text-brand-navy mb-2">Send Us a Message</h2>
              <p className="text-gray-500 text-sm mb-6 sm:mb-8">
                Fill out the form below and we&apos;ll respond within 24 hours.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                {submitted && (
                  <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-medium">
                    ✅ Thank you! We&apos;ll get back to you within 24 hours.
                  </div>
                )}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                    {error}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="text-sm font-bold text-brand-navy mb-1.5 block">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition text-brand-navy"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-brand-navy mb-1.5 block">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition text-brand-navy"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-bold text-brand-navy mb-1.5 block">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+977 98XXXXXXXX"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition text-brand-navy"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-brand-navy mb-1.5 block">Subject *</label>
                    <select
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition bg-white text-brand-navy"
                    >
                      <option value="">Select a topic</option>
                      <option value="booking">Tour Booking</option>
                      <option value="custom">Custom Itinerary</option>
                      <option value="event">Event Inquiry</option>
                      <option value="partnership">Partnership</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-brand-navy mb-1.5 block">Message *</label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about your dream trip, dates, group size, or any questions..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition resize-none text-brand-navy"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-brand-red text-white font-bold py-4 rounded-xl text-base hover:bg-red-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-brand-red/20 disabled:opacity-60"
                >
                  {submitting ? "Sending..." : "Send Message"}
                </button>
              </form>
              </div>
            </MotionWrapper>
          </div>
        </div>
      </section>

      {/* ═══════════ FULL-WIDTH MAP ═══════════ */}
      <section className="w-full px-4 sm:px-6 lg:px-8 pb-10 max-w-7xl mx-auto">
        <div className="rounded-3xl overflow-hidden shadow-[0_20px_60px_-20px_rgba(15,23,42,0.2)] border border-slate-100">
          <div className="bg-brand-navy px-6 py-4 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-brand-red" />
              <div className="w-3 h-3 rounded-full bg-brand-orange" />
              <div className="w-3 h-3 rounded-full bg-brand-green" />
            </div>
            <p className="text-white/70 text-sm font-medium ml-2">📍 {address || "Get Tours Nepal — Thamel, Kathmandu, Nepal"}</p>
          </div>
          <iframe
            src={MAP_EMBED_SRC}
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`Get Tours Nepal — ${address || "Thamel, Kathmandu"}`}
            className="w-full"
          />
        </div>
      </section>

      <section
        className="parallax-bg relative py-20 sm:py-28 overflow-hidden"
        style={{
          backgroundImage: `url('${sectionImages.contactCta}')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/70 via-brand-navy/60 to-brand-navy/70" />
        <MotionWrapper variant="scale-up" className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
            Ready to Plan Your Nepal Journey?
          </h2>
          <p className="text-gray-300 text-base sm:text-lg mb-6 sm:mb-8 max-w-xl mx-auto">
            Share your dates, travel style, and ideas with us, and we&apos;ll help shape the right trip for you.
          </p>
          <Link
            href="/tours"
            className="group inline-flex items-center gap-2 bg-brand-red text-white font-semibold px-8 py-3.5 rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            Explore Tours
            <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </MotionWrapper>
      </section>

    </div>
  );
}
