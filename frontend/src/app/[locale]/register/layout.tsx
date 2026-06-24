import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account — Register for Free",
  description:
    "Register for a free Get Tours Nepal account. Book Everest treks, Annapurna circuits, cultural tours, and events. Email-verified secure registration.",
  openGraph: {
    title: "Create Account — Get Tours Nepal",
    description: "Join 10,000+ travelers. Register to book Nepal's best tours and experiences.",
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
