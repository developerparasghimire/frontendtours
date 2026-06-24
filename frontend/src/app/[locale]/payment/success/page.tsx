import { Suspense } from "react";
import PaymentSuccessClient from "./PaymentSuccessClient";

export const metadata = { title: "Payment Successful — Get Tours Nepal" };

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center text-gray-500">Verifying payment…</div>}>
      <PaymentSuccessClient />
    </Suspense>
  );
}
