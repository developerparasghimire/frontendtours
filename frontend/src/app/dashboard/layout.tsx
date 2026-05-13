import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Dashboard — Get Tours Nepal",
  description: "View and manage your tour and event bookings, profile, and travel history.",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
