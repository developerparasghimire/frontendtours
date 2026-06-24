import Link from "next/link";

export const metadata = { title: "Payment Cancelled — Get Tours Nepal" };

export default function Page() {
  return (
    <section className="max-w-xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-12">
        <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.74-2.99l-6.93-12a2 2 0 00-3.48 0l-6.93 12A2 2 0 005.07 19z"
            />
          </svg>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy mb-3">
          Payment Cancelled
        </h1>
        <p className="text-gray-600 mb-8">
          You cancelled the payment. Your booking is still saved — you can
          retry payment any time from your dashboard.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center bg-brand-red text-white font-bold px-8 py-3.5 rounded-xl hover:bg-red-700 transition-colors shadow-lg"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/tours"
            className="inline-flex items-center justify-center bg-white text-brand-navy font-bold px-8 py-3.5 rounded-xl border border-gray-200 hover:border-brand-blue hover:text-brand-blue transition-colors"
          >
            Browse Tours
          </Link>
        </div>
      </div>
    </section>
  );
}
