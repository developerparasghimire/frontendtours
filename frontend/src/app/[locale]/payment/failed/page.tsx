import Link from "next/link";

export const metadata = { title: "Payment Failed — Get Tours Nepal" };

type SearchParams = { reason?: string; order?: string };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { reason, order } = await searchParams;
  const isDeclined = reason === "failed";
  return (
    <section className="max-w-xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-12">
        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy mb-3">
          {isDeclined ? "Payment Declined by Bank" : "Payment Failed"}
        </h1>
        <p className="text-gray-600 mb-4">
          {isDeclined
            ? "Your card was authenticated successfully, but your bank declined the payment. No funds were captured."
            : "We could not process your payment. No funds were captured."}
        </p>

        {isDeclined && (
          <div className="text-left bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6 text-sm text-amber-900 leading-relaxed">
            <p className="font-bold mb-2">Common reasons:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>International payments not enabled</strong> on your card. Most banks
                require you to switch this on in their mobile app (Card Controls → International / Online).
              </li>
              <li><strong>Daily / monthly card limit</strong> exceeded or set to zero.</li>
              <li><strong>Insufficient funds</strong> for the transaction amount.</li>
              <li>Bank fraud system flagged the transaction — call your bank to authorize.</li>
              <li>
                <strong>Nepali debit cards</strong> often cannot pay in USD due to Nepal Rastra
                Bank rules. Please use an internationally enabled card.
              </li>
            </ul>
            <p className="mt-3 text-xs text-amber-700">
              The failure came from your card-issuing bank, not from our website. Try a different
              card or contact your bank, then book again.
            </p>
          </div>
        )}

        {(order || reason) && (
          <p className="text-xs text-gray-400 mb-6 font-mono">
            {order ? `order=${order} ` : ""}
            {reason ? `reason=${reason}` : ""}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center bg-brand-navy text-white font-bold px-8 py-3.5 rounded-xl hover:bg-brand-blue transition-colors shadow-lg"
          >
            View My Bookings
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center bg-white text-brand-navy font-bold px-8 py-3.5 rounded-xl border border-gray-200 hover:border-brand-blue hover:text-brand-blue transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </section>
  );
}
