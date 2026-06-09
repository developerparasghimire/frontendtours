"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth";
import { resendVerification } from "@/lib/api";
import { Suspense } from "react";
import { sectionImages } from "@/lib/sectionImages";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";
import { safeRedirectOr } from "@/lib/urlutils";

function RegisterForm() {
  const { register, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = safeRedirectOr(searchParams.get("redirect"), "/");
  const hasGoogleSignIn = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirect);
    }
  }, [isAuthenticated, redirect, router]);

  if (isAuthenticated) {
    return null;
  }

  // Password strength checker
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
  const pwStrength = getPasswordStrength(form.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const username = form.username.trim();
    const email = form.email.trim().toLowerCase();

    if (username.length < 3) {
      setError("Username must be at least 3 characters long.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!/[A-Z]/.test(form.password)) {
      setError("Password must contain at least one uppercase letter.");
      return;
    }
    if (!/[a-z]/.test(form.password)) {
      setError("Password must contain at least one lowercase letter.");
      return;
    }
    if (!/\d/.test(form.password)) {
      setError("Password must contain at least one digit.");
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(form.password)) {
      setError("Password must contain at least one special character (!@#$%^&*...).");
      return;
    }

    setLoading(true);
    try {
      await register({
        first_name: form.first_name,
        last_name: form.last_name,
        username,
        email,
        password: form.password,
      });
      setRegisteredEmail(email);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed";
      setError(message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    setResendMsg("");
    try {
      await resendVerification(registeredEmail);
      setResendMsg("A new verification link has been sent to your email.");
    } catch {
      setResendMsg("Failed to resend. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  // Show success screen after registration
  if (registeredEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-5 py-10">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(15,23,42,0.13)] border border-slate-100 p-10 text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-green-50 rounded-2xl flex items-center justify-center border border-green-100">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-brand-navy mb-2 tracking-tight">Check Your Email</h2>
            <p className="text-slate-500 text-sm mb-1">We&apos;ve sent a verification link to:</p>
            <p className="font-black text-brand-navy text-sm mb-4 bg-slate-50 rounded-xl px-4 py-2 border border-slate-100">{registeredEmail}</p>
            <p className="text-slate-400 text-xs mb-6 leading-relaxed">
              Click the link in the email to activate your account. The link expires in 24 hours.
            </p>

            {resendMsg && (
              <div className={`mb-4 p-3 rounded-2xl text-xs ${resendMsg.includes("Failed") ? "bg-red-50 text-red-700 border border-red-100" : "bg-green-50 text-green-700 border border-green-100"}`}>
                {resendMsg}
              </div>
            )}

            <button onClick={handleResendVerification} disabled={resendLoading}
              className="text-brand-red font-bold hover:underline disabled:opacity-50 mb-6 block mx-auto text-sm">
              {resendLoading ? "Sending..." : "Didn't receive it? Resend →"}
            </button>

            <Link href="/login"
              className="inline-flex items-center gap-2 bg-brand-red text-white font-black py-3.5 px-8 rounded-2xl hover:bg-[#c01100] transition-all shadow-lg shadow-brand-red/25 text-sm">
              Go to Login →
            </Link>
          </div>

          <div className="mt-5 text-center">
            <Link href="/" className="text-slate-400 text-sm hover:text-brand-navy transition-colors">← Back to Home</Link>
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
          src={sectionImages.register}
          alt="Nepal mountains"
          fill
          className="object-cover object-center"
          priority
          sizes="46vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/70 via-brand-navy/60 to-brand-navy/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/56 via-transparent to-brand-navy/22" />
        <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:36px_36px]" />
        <div className="absolute top-0 left-0 w-72 h-72 bg-brand-green/15 rounded-full blur-[90px] pointer-events-none" />

        <div className="relative z-10 flex h-full flex-col gap-14 p-10 xl:gap-16 xl:p-14">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/95 p-1.5 shadow-lg ring-1 ring-white/15">
              <Image src="/logo.png" alt="Get Tours Logo" width={32} height={32} className="h-full w-full object-contain" />
            </div>
            <div className="leading-none">
              <span className="text-white font-black text-xl tracking-tight">Get Tours</span>
              <span className="block text-white/40 text-[10px] font-bold tracking-[0.28em] uppercase">Nepal</span>
            </div>
          </Link>

          <div className="max-w-sm">
            <p className="inline-flex items-center gap-2 text-brand-green text-[0.63rem] font-black tracking-[0.28em] uppercase mb-4">
              <span className="w-4 h-px bg-brand-green inline-block" />Join the Community
            </p>
            <h1 className="text-4xl xl:text-5xl font-black text-white mb-4 leading-[1.06] tracking-[-0.03em]">
              Start Your<br />Nepal Adventure
            </h1>
            <p className="text-white/68 text-[0.95rem] leading-relaxed max-w-xs mb-8">
              Create an account to book tours, track your trips, and connect with Himalayan experts.
            </p>
            <div className="space-y-3.5">
              {[
                { icon: "M5 13l4 4L19 7", text: "Book tours & events instantly", color: "bg-brand-green/20 text-brand-green" },
                { icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", text: "Track all your bookings", color: "bg-brand-orange/20 text-brand-orange" },
                { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", text: "Secure & verified bookings", color: "bg-brand-blue/20 text-brand-blue" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3">
                  <div className={`w-8 h-8 ${item.color} rounded-xl flex items-center justify-center shrink-0`}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                  </div>
                  <span className="text-white/80 text-sm">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-start justify-center px-5 sm:px-10 py-10 bg-slate-50 overflow-y-auto min-h-screen">
        <div className="w-full max-w-[420px] my-auto">
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
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-black text-brand-navy tracking-tight mb-1.5">Create Account</h2>
              <p className="text-slate-400 text-sm">
                Already have an account?{" "}
                <Link href={`/login${redirect !== "/" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`} className="text-brand-red font-bold hover:underline">
                  Sign in
                </Link>
              </p>
            </div>

            {error && (
              <div className="mb-5 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm flex items-start gap-3">
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <>
              <GoogleAuthButton mode="signup" redirect={redirect} onError={setError} />
              <div className="mb-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-slate-400">
                  Or continue with email
                </span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
            </>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[0.7rem] font-black text-slate-500 uppercase tracking-[0.13em] mb-1.5">First Name</label>
                  <input type="text" required value={form.first_name} onChange={(e) => updateField("first_name", e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red/50 transition-all text-brand-navy placeholder-slate-400 text-sm"
                    placeholder="John" />
                </div>
                <div>
                  <label className="block text-[0.7rem] font-black text-slate-500 uppercase tracking-[0.13em] mb-1.5">Last Name</label>
                  <input type="text" required value={form.last_name} onChange={(e) => updateField("last_name", e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red/50 transition-all text-brand-navy placeholder-slate-400 text-sm"
                    placeholder="Doe" />
                </div>
              </div>

              <div>
                <label className="block text-[0.7rem] font-black text-slate-500 uppercase tracking-[0.13em] mb-1.5">Username</label>
                <input type="text" required value={form.username} onChange={(e) => updateField("username", e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red/50 transition-all text-brand-navy placeholder-slate-400 text-sm"
                  placeholder="johndoe" />
              </div>

              <div>
                <label className="block text-[0.7rem] font-black text-slate-500 uppercase tracking-[0.13em] mb-1.5">Email Address</label>
                <input type="email" required value={form.email} onChange={(e) => updateField("email", e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red/50 transition-all text-brand-navy placeholder-slate-400 text-sm"
                  placeholder="you@example.com" />
              </div>

              <div>
                <label className="block text-[0.7rem] font-black text-slate-500 uppercase tracking-[0.13em] mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} required value={form.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    className="w-full px-4 pr-12 py-3 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red/50 transition-all text-brand-navy placeholder-slate-400 text-sm"
                    placeholder="Min 8 characters" minLength={8} />
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
                {form.password && (
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
                <label className="block text-[0.7rem] font-black text-slate-500 uppercase tracking-[0.13em] mb-1.5">Confirm Password</label>
                <input type="password" required value={form.confirmPassword} onChange={(e) => updateField("confirmPassword", e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red/50 transition-all text-brand-navy placeholder-slate-400 text-sm"
                  placeholder="Re-enter password" minLength={8} />
              </div>

              <button type="submit" disabled={loading}
                className="w-full mt-1 bg-brand-red text-white font-black py-4 rounded-2xl hover:bg-[#c01100] transition-all duration-300 shadow-lg shadow-brand-red/25 hover:shadow-brand-red/40 hover:-translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2 text-sm tracking-wide">
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating Account...
                  </>
                ) : "Create Account →"}
              </button>
            </form>

            <p className="mt-5 text-center text-slate-400 text-xs">
              By creating an account, you agree to our{" "}
              <Link href="/terms" className="underline hover:text-brand-navy">Terms</Link> &amp;{" "}
              <Link href="/privacy" className="underline hover:text-brand-navy">Privacy Policy</Link>.
            </p>
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

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><span className="text-gray-400">Loading...</span></div>}>
      <RegisterForm />
    </Suspense>
  );
}
