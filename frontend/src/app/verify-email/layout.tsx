import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Email — Activate Your Account",
  description:
    "Verify your email address to activate your Get Tours Nepal account and start booking tours, treks, and events.",
  robots: { index: false, follow: false },
};

export default function VerifyEmailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
