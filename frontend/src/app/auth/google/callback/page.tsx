"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function GoogleCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const access = searchParams.get("access");
    const refresh = searchParams.get("refresh");
    const error = searchParams.get("google_error");

    if (error || !access || !refresh) {
      router.replace("/login?error=google_failed");
      return;
    }

    // Store JWT tokens exactly as the auth context expects them
    try {
      localStorage.setItem("auth_tokens", JSON.stringify({ access, refresh }));
    } catch {
      router.replace("/login?error=google_failed");
      return;
    }

    // Dispatch the same event the auth context listens for so it picks up the tokens
    window.dispatchEvent(
      new CustomEvent("auth:tokens-updated", {
        detail: { scope: "user", access, refresh },
      })
    );

    router.replace("/");
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-brand-red border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-sm">Signing you in with Google…</p>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense>
      <GoogleCallbackHandler />
    </Suspense>
  );
}
