"use client";

import { useState, type FormEvent } from "react";
import { subscribeNewsletter } from "@/lib/api";

interface SubscribeFormProps {
  /** If true, renders a compact inline layout (input + button side-by-side) */
  compact?: boolean;
  className?: string;
}

export default function SubscribeForm({ compact = false, className = "" }: SubscribeFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const res = await subscribeNewsletter(email.trim());
      setStatus("success");
      setMessage(res.message || "Thank you for subscribing!");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className={`flex items-center gap-2 text-green-400 font-semibold ${className}`}>
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
        {message}
      </div>
    );
  }

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className={`flex flex-col sm:flex-row gap-3 ${className}`}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          className="flex-1 px-5 py-3 rounded-xl bg-white border border-white/30 text-brand-navy placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-red shadow-sm"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="bg-brand-red hover:bg-red-700 disabled:opacity-60 text-white font-bold px-8 py-3 rounded-xl transition-colors whitespace-nowrap"
        >
          {status === "loading" ? "Subscribing…" : "Subscribe"}
        </button>
        {status === "error" && (
          <p className="w-full text-red-300 text-sm mt-1">{message}</p>
        )}
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`w-full ${className}`}>
      <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          className="flex-1 px-5 py-3 rounded-xl bg-white border border-white/30 text-brand-navy placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-red shadow-sm"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="bg-brand-red hover:bg-red-700 disabled:opacity-60 text-white font-bold px-8 py-3 rounded-xl transition-colors whitespace-nowrap"
        >
          {status === "loading" ? "Subscribing…" : "Subscribe"}
        </button>
      </div>
      {status === "error" && (
        <p className="text-red-300 text-sm mt-3 text-center">{message}</p>
      )}
    </form>
  );
}
