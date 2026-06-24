"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { resetPassword } from "@/lib/api";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Password strength
  const getPasswordStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pw)) score++;
    return score;
  };
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"];
  const pwStrength = getPasswordStrength(password);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-5 py-10">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(15,23,42,0.13)] border border-slate-100 p-10 text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-red-50 rounded-2xl flex items-center justify-center border border-red-100">
              <svg className="w-8 h-8 text-brand-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-brand-navy mb-2 tracking-tight">Invalid Reset Link</h2>
            <p className="text-slate-500 text-sm mb-8">This password reset link is invalid or missing a token.</p>
            <Link href="/forgot-password"
              className="inline-flex items-center gap-2 bg-brand-red text-white font-black py-3.5 px-8 rounded-2xl hover:bg-[#c01100] transition-all shadow-lg shadow-brand-red/25 text-sm">
              Request New Reset Link →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-5 py-10">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(15,23,42,0.13)] border border-slate-100 p-10 text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-green-50 rounded-2xl flex items-center justify-center border border-green-100">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-brand-navy mb-2 tracking-tight">Password Reset!</h2>
            <p className="text-slate-500 text-sm mb-8">Your password has been changed. You can now sign in with your new password.</p>
            <Link href="/login"
              className="inline-flex items-center gap-2 bg-brand-red text-white font-black py-3.5 px-8 rounded-2xl hover:bg-[#c01100] transition-all shadow-lg shadow-brand-red/25 text-sm">
              Sign In →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least one uppercase letter.");
      return;
    }
    if (!/[a-z]/.test(password)) {
      setError("Password must contain at least one lowercase letter.");
      return;
    }
    if (!/\d/.test(password)) {
      setError("Password must contain at least one digit.");
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setError("Password must contain at least one special character.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      const lower = msg.toLowerCase();
      // H27 / double-submit: token was already used because the first
      // request succeeded but the browser never got the response.
      if (lower.includes("already been reset") || lower.includes("already reset")) {
        setSuccess(true);
      } else {
        setError(msg || "Failed to reset password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Image */}
      <div className="hidden lg:flex lg:w-[46%] xl:w-[42%] shrink-0 relative overflow-hidden">
        <Image
          src="/img/landscape_background_small.jpg"
          alt="Nepal Mountains"
          fill
          className="object-cover scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/70 via-brand-navy/60 to-brand-navy/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/56 via-transparent to-brand-navy/22" />
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.04]" style={{backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "40px 40px"}} />
        {/* Glow orb */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-red/15 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />

        <div className="relative z-10 flex flex-col h-full px-12 xl:px-14 py-12">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-2xl overflow-hidden shadow-xl ring-2 ring-white/20">
              <Image src="/logo.png" alt="Logo" fill className="object-cover" sizes="44px" />
            </div>
            <div>
              <span className="text-white font-black text-xl tracking-tight">Get Tours Nepal</span>
              <span className="block text-white/40 text-[0.6rem] font-medium tracking-[0.2em] uppercase">Adventure Awaits</span>
            </div>
          </Link>

          {/* Main content */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/80 text-[0.7rem] font-semibold uppercase tracking-wider mb-6 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-red animate-pulse" />
              Account Security
            </div>
            <h1 className="text-4xl xl:text-5xl font-black text-white leading-[1.1] mb-5 tracking-tight">
              Set Your<br />New Password
            </h1>
            <p className="text-white/68 text-sm leading-relaxed max-w-xs mb-10">
              Create a strong, unique password to keep your adventure account safe and secure.
            </p>
            <div className="space-y-3">
              {[
                {color: "bg-brand-red/20 border-brand-red/30", icon: "text-brand-red", label: "Choose 8+ characters"},
                {color: "bg-brand-orange/20 border-brand-orange/30", icon: "text-brand-orange", label: "Mix letters, numbers & symbols"},
                {color: "bg-brand-blue/20 border-brand-blue/30", icon: "text-brand-blue", label: "Never share your password"},
              ].map(({color, icon, label}) => (
                <div key={label} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg ${color} border flex items-center justify-center shrink-0`}>
                    <svg className={`w-3.5 h-3.5 ${icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-white/75 text-sm">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quote */}
          <div className="border-t border-white/10 pt-6">
            <p className="text-white/40 text-xs italic leading-relaxed">&ldquo;Security is not a product, but a process.&rdquo;</p>
            <p className="text-white/30 text-[0.65rem] mt-1 uppercase tracking-widest">-- Bruce Schneier</p>
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center px-5 sm:px-10 py-10 bg-slate-50">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow ring-1 ring-slate-200">
                <Image src="/logo.png" alt="Logo" fill className="object-cover" sizes="36px" />
              </div>
              <span className="font-black text-lg text-brand-navy">Get Tours Nepal</span>
            </Link>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(15,23,42,0.13)] border border-slate-100 p-8 sm:p-10">
            <div className="mb-7">
              <div className="w-12 h-12 rounded-2xl bg-brand-red/10 flex items-center justify-center mb-5 border border-brand-red/15">
                <svg className="w-5 h-5 text-brand-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-brand-navy tracking-tight mb-1.5">New Password</h2>
              <p className="text-slate-400 text-sm">Choose a strong password for your account.</p>
            </div>

            {error && (
              <div className="mb-5 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm flex items-start gap-3">
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[0.7rem] font-black text-slate-500 uppercase tracking-[0.13em] mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 pr-12 py-3.5 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red/50 transition-all text-brand-navy placeholder-slate-400 text-sm"
                    placeholder="Min 8 characters"
                    minLength={8}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < pwStrength ? strengthColors[pwStrength - 1] : "bg-slate-200"}`} />
                      ))}
                    </div>
                    <p className={`text-[0.68rem] ${pwStrength >= 4 ? "text-green-600" : pwStrength >= 3 ? "text-blue-600" : "text-slate-400"}`}>
                      {strengthLabels[pwStrength - 1] || "Very Weak"} — uppercase, lowercase, digit & special char
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[0.7rem] font-black text-slate-500 uppercase tracking-[0.13em] mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3.5 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red/50 transition-all text-brand-navy placeholder-slate-400 text-sm"
                  placeholder="Re-enter new password"
                  minLength={8}
                />
              </div>

              <button type="submit" disabled={loading}
                className="w-full mt-1 bg-brand-red text-white font-black py-4 rounded-2xl hover:bg-[#c01100] transition-all duration-300 shadow-lg shadow-brand-red/25 hover:shadow-brand-red/40 hover:-translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2 text-sm tracking-wide">
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Resetting...
                  </>
                ) : "Reset Password →"}
              </button>
            </form>
          </div>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-slate-400 text-sm hover:text-brand-navy transition-colors font-medium">
              &larr; Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-brand-red rounded-full animate-spin" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
