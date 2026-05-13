"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface to console in dev; in prod the digest is the breadcrumb shown
    // to the user. Wire up Sentry/Datadog here when available.
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("Unhandled app error:", error);
    }
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 py-20">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-red mb-3">
          Something went wrong
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-navy mb-4">
          We hit an unexpected error
        </h1>
        <p className="text-gray-600 mb-8">
          Sorry about that. You can try again, or head back home.
          {error?.digest ? (
            <>
              <br />
              <span className="text-xs text-gray-400">
                Reference: <code>{error.digest}</code>
              </span>
            </>
          ) : null}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="bg-brand-red hover:bg-brand-red/90 text-white font-semibold px-6 py-3 rounded-full transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="bg-gray-100 hover:bg-gray-200 text-brand-navy font-semibold px-6 py-3 rounded-full transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
