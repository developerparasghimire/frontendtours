import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login — Sign In to Your Account",
  description:
    "Sign in to your Get Tours Nepal account to manage bookings, view itineraries, and access exclusive travel deals across Nepal. Secure login with email verification.",
  openGraph: {
    title: "Login — Get Tours Nepal",
    description: "Sign in to manage your Nepal travel bookings and adventures.",
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
