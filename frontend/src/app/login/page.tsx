"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth";
import { resendVerification } from "@/lib/api";
import { Suspense } from "react";
import { sectionImages } from "@/lib/sectionImages";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";
import { safeRedirectOr } from "@/lib/sanitize";

function LoginForm() {
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = safeRedirectOr(searchParams.get("redirect"), "/");
  const hasGoogleSignIn = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState("");

  function isRateLimitError(message: string) {
    return /429|too many|throttl|rate limit/i.test(message);
  }

  function isUnverifiedEmailError(message: string) {
    return /verify|verified|verification|email_not_verified/i.test(message);
  }

  // Redirect if already logged in — navigate from an effect to avoid updating
  // a different component during render (Router) which React disallows.
  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirect);
    }
  }, [isAuthenticated, router, redirect]);

  if (isAuthenticated) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setShowResend(false);
    setResendMsg("");
    setLoading(true);
    try {
      await login(email, password);
      router.push(redirect);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "";
      if (isRateLimitError(message)) {
        setError("Too many login attempts. Please wait a little while and try again.");
      } else if (isUnverifiedEmailError(message)) {
        setError("Please verify your email before logging in.");
        setShowResend(true);
      } else {
        setError("Invalid email or password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setResendMsg("Please enter your email address above first.");
      return;
    }
    setResendLoading(true);
    setResendMsg("");
    try {
      await resendVerification(email);
      setResendMsg("If your account is unverified, a new verification link has been sent.");
    } catch {
      setResendMsg("Failed to resend. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left: Mountain photo panel ── */}
      <div className="hidden lg:flex lg:w-[46%] xl:w-[42%] relative overflow-hidden shrink-0">
        <Image
          src={sectionImages.login}
          alt="Nepal trekking"
          fill
          className="object-cover object-center"
          priority
          sizes="46vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/70 via-brand-navy/60 to-brand-navy/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/56 via-transparent to-brand-navy/22" />
        <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:36px_36px]" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-red/15 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between h-full p-10 xl:p-14">
          {/* Logo top */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/95 p-1.5 shadow-lg ring-1 ring-white/15">
              <Image src="/logo.png" alt="Get Tours Logo" width={32} height={32} className="h-full w-full object-contain" />
            </div>
            <div className="leading-none">
              <span className="text-white font-black text-xl tracking-tight">Get Tours</span>
              <span className="block text-white/40 text-[10px] font-bold tracking-[0.28em] uppercase">Nepal</span>
            </div>
          </Link>

          {/* Headline center */}
          <div>
            <p className="inline-flex items-center gap-2 text-brand-orange text-[0.63rem] font-black tracking-[0.28em] uppercase mb-5">
              <span className="w-4 h-px bg-brand-orange inline-block" />Welcome Back
            </p>
            <h1 className="text-4xl xl:text-5xl font-black text-white mb-5 leading-[1.06] tracking-[-0.03em]">
              Your Adventure<br />Awaits You
            </h1>
            <p className="text-white/68 text-[0.95rem] leading-relaxed max-w-xs mb-10">
              Sign in to access your bookings, explore new treks, and continue your Nepal journey.
            </p>
            <div className="flex gap-8">
              {[
                { value: "10K+", label: "Happy Trekkers" },
                { value: "150+", label: "Trek Routes" },
                { value: "24/7", label: "Support" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-black text-white leading-none">{s.value}</p>
                  <p className="text-white/40 text-[0.65rem] font-bold mt-1 tracking-wide uppercase">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quote bottom */}
          <p className="text-white/20 text-xs italic leading-relaxed">
            &ldquo;The mountains are calling and I must go.&rdquo; — John Muir
          </p>
        </div>
      </div>

      {/* ── Right: Form panel ── */}
      <div className="flex-1 flex items-center justify-center px-5 sm:px-10 py-10 bg-slate-50">
        <div className="w-full max-w-[420px]">

          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white p-1.5 shadow ring-1 ring-slate-200">
                <Image src="/logo.png" alt="Get Tours Logo" width={32} height={32} className="h-full w-full object-contain" />
              </div>
              <span className="font-black text-lg text-brand-navy">Get Tours Nepal</span>
            </Link>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(15,23,42,0.13)] border border-slate-100 p-8 sm:p-10">
            <div className="mb-7">
              <h2 className="text-2xl sm:text-3xl font-black text-brand-navy tracking-tight mb-1.5">Sign In</h2>
              <p className="text-slate-400 text-sm">
                New here?{" "}
                <Link href={`/register${redirect !== "/" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`} className="text-brand-red font-bold hover:underline">
                  Create an account
                </Link>
              </p>
            </div>

            {error && (
              <div className="mb-5 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm flex items-start gap-3">
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <span>{error}</span>
                  {showResend && (
                    <div className="mt-2">
                      <button
                        onClick={handleResendVerification}
                        disabled={resendLoading}
                        className="text-brand-red font-bold hover:underline text-xs disabled:opacity-50"
                      >
                        {resendLoading ? "Sending..." : "Resend verification email →"}
                      </button>
                    </div>
                  )}
                  {resendMsg && (
                    <p className={`mt-1 text-xs ${resendMsg.includes("Failed") ? "text-red-600" : "text-green-700"}`}>{resendMsg}</p>
                  )}
                </div>
              </div>
            )}

            <>
              <GoogleAuthButton mode="signin" redirect={redirect} onError={setError} />
              <div className="mb-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-slate-400">
                  Or continue with email
                </span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
            </>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
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
                    className="w-full pl-10 pr-4 py-3.5 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red/50 transition-all text-brand-navy placeholder-slate-400 text-sm"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[0.7rem] font-black text-slate-500 uppercase tracking-[0.13em]">Password</label>
                  <Link href="/forgot-password" className="text-[0.7rem] text-brand-red font-bold hover:underline">Forgot password?</Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3.5 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red/50 transition-all text-brand-navy placeholder-slate-400 text-sm"
                    placeholder="Enter your password"
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
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
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-brand-red text-white font-black py-4 rounded-2xl hover:bg-[#c01100] transition-all duration-300 shadow-lg shadow-brand-red/25 hover:shadow-brand-red/40 hover:-translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2 text-sm tracking-wide"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing In...
                </>
              ) : "Sign In →"}
            </button>
          </form>
          </div>

          <div className="mt-6 text-center">
            <Link href="/" className="text-slate-400 text-sm hover:text-brand-navy transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><span className="text-gray-400">Loading...</span></div>}>
      <LoginForm />
    </Suspense>
  );
}
