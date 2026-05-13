"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { forgotPassword } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-5 py-10">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(15,23,42,0.13)] border border-slate-100 p-10 text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100">
              <svg className="w-8 h-8 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-brand-navy mb-2 tracking-tight">Check Your Email</h2>
            <p className="text-slate-500 text-sm mb-1">
              If an account exists for <span className="font-black text-brand-navy">{email}</span>,
            </p>
            <p className="text-slate-500 text-sm mb-6">we&apos;ve sent a password reset link. The link expires in 1 hour.</p>
            <div className="flex flex-col gap-3 items-center">
              <button
                onClick={() => { setSent(false); setEmail(""); }}
                className="text-brand-red font-bold hover:underline text-sm"
              >
                Try a different email
              </button>
              <Link href="/login" className="text-slate-400 text-sm hover:text-brand-navy transition-colors">
                ← Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left - Photo Panel */}
      <div className="hidden lg:flex lg:w-[46%] xl:w-[42%] relative overflow-hidden shrink-0">
        <Image
          src="/img/landscape_background_small.jpg"
          alt="Nepal Mountains"
          fill
          className="object-cover object-center"
          priority
          sizes="46vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/70 via-brand-navy/60 to-brand-navy/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/56 via-transparent to-brand-navy/22" />
        <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:36px_36px]" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-brand-blue/15 rounded-full blur-[90px] pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between h-full p-10 xl:p-14">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-11 h-11 rounded-2xl overflow-hidden shadow-lg ring-1 ring-white/10">
              <Image src="/logo.png" alt="Logo" fill className="object-cover" sizes="44px" />
            </div>
            <div>
              <span className="text-white font-black text-xl tracking-tight">Get Tours</span>
              <span className="block text-white/40 text-[10px] font-bold tracking-[0.28em] uppercase">Nepal</span>
            </div>
          </Link>

          <div>
            <p className="inline-flex items-center gap-2 text-brand-blue text-[0.63rem] font-black tracking-[0.28em] uppercase mb-5">
              <span className="w-4 h-px bg-brand-blue inline-block" />Account Recovery
            </p>
            <h1 className="text-4xl xl:text-5xl font-black text-white mb-5 leading-[1.06] tracking-[-0.03em]">
              Forgot Your<br />Password?
            </h1>
            <p className="text-white/68 text-[0.95rem] leading-relaxed max-w-xs mb-10">
              No worries — enter your email and we&apos;ll send you a secure link to reset it in minutes.
            </p>
            <div className="space-y-4">
              {[
                { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", text: "Secure reset link sent to your email" },
                { icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", text: "Link expires in 1 hour" },
                { icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z", text: "Your account stays secure" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-brand-blue/20 rounded-xl flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                  </div>
                  <span className="text-white/70 text-sm">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-white/20 text-xs italic">
            &ldquo;Not all those who wander are lost.&rdquo; — J.R.R. Tolkien
          </p>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center px-5 sm:px-10 py-10 bg-slate-50">
        <div className="w-full max-w-[420px]">
          {/* Card */}
          <div className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(15,23,42,0.13)] border border-slate-100 p-8 sm:p-10">
            <div className="mb-7">
              <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 flex items-center justify-center mb-5 border border-brand-blue/15">
                <svg className="w-5 h-5 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-brand-navy tracking-tight mb-1.5">Reset Password</h2>
              <p className="text-slate-400 text-sm">
                Enter your email and we&apos;ll send you a secure reset link.
              </p>
            </div>

            {error && (
              <div className="mb-5 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[0.7rem] font-black text-slate-500 uppercase tracking-[0.13em] mb-1.5">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue/50 transition-all text-brand-navy placeholder-slate-400 text-sm"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-red text-white font-black py-4 rounded-2xl hover:bg-[#c01100] transition-all duration-300 shadow-lg shadow-brand-red/25 hover:shadow-brand-red/40 hover:-translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2 text-sm tracking-wide"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending...
                  </>
                ) : "Send Reset Link →"}
              </button>
            </form>
          </div>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-slate-400 text-sm hover:text-brand-navy transition-colors">
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
