"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { verifyEmail } from "@/lib/api";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link. No token provided.");
      return;
    }

    verifyEmail(token)
      .then((res) => {
        setStatus("success");
        setMessage(res.message || "Email verified successfully!");
      })
      .catch((err) => {
        setStatus("error");
        const msg = err instanceof Error ? err.message : "Verification failed.";
        if (msg.includes("400")) {
          setMessage("This verification link has expired or already been used. Please request a new one from the login page.");
        } else {
          setMessage("Verification failed. Please try again or request a new link.");
        }
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="max-w-md w-full text-center">
        {status === "loading" && (
          <>
            <div className="w-16 h-16 mx-auto mb-6 border-4 border-gray-200 border-t-brand-red rounded-full animate-spin" />
            <h2 className="text-xl font-bold text-brand-navy">Verifying your email...</h2>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-extrabold text-brand-navy mb-3">Email Verified!</h2>
            <p className="text-gray-600 mb-8">{message}</p>
            <Link
              href="/login"
              className="inline-block bg-brand-red text-white font-bold py-3.5 px-10 rounded-xl hover:bg-red-700 transition-all shadow-lg"
            >
              Sign In to Your Account
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-extrabold text-brand-navy mb-3">Verification Failed</h2>
            <p className="text-gray-600 mb-8">{message}</p>
            <div className="flex flex-col gap-3 items-center">
              <Link
                href="/login"
                className="inline-block bg-brand-red text-white font-bold py-3 px-8 rounded-xl hover:bg-red-700 transition-all"
              >
                Go to Login
              </Link>
              <Link href="/" className="text-gray-500 text-sm hover:text-brand-navy transition-colors">
                &larr; Back to Home
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-brand-red rounded-full animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
