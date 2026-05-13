import Link from "next/link";

export const metadata = {
  title: "Page not found | Get Tours Nepal",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 py-20">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-red mb-3">
          404
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-navy mb-4">
          We couldn&apos;t find that page
        </h1>
        <p className="text-gray-600 mb-8">
          The link may be outdated or the page has moved. Try one of the routes
          below.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="bg-brand-red hover:bg-brand-red/90 text-white font-semibold px-6 py-3 rounded-full transition-colors"
          >
            Home
          </Link>
          <Link
            href="/tours"
            className="bg-gray-100 hover:bg-gray-200 text-brand-navy font-semibold px-6 py-3 rounded-full transition-colors"
          >
            Browse tours
          </Link>
          <Link
            href="/contact"
            className="bg-gray-100 hover:bg-gray-200 text-brand-navy font-semibold px-6 py-3 rounded-full transition-colors"
          >
            Contact us
          </Link>
        </div>
      </div>
    </div>
  );
}
