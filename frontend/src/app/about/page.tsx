import type { Metadata } from "next";
import { getAboutStats, getValues, getLeaders, getMilestones, getSiteConfig } from "@/lib/api";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "About Get Tours Nepal — Our Story, Team & Mission | Trekking Agency",
  description:
    "Founded in 2018 in Thamel, Kathmandu, Get Tours Nepal is the Himalayas' most trusted trekking agency. 10,000+ guided trekkers, 150+ verified routes, expert Sherpa guides, and a passion for authentic mountain travel.",
  keywords: [
    "about Get Tours Nepal",
    "Nepal trekking agency story",
    "Sherpa guides Nepal",
    "best Nepal travel agency 2025",
    "trusted Nepal tour operator",
    "Kathmandu trekking company",
    "Nepal mountain guides",
    "Himalayan trek specialists",
  ],
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Get Tours Nepal — 25+ Years of Himalayan Trekking Excellence",
    description:
      "Nepal's most trusted trekking agency. 25+ years of experience, expert Sherpa guides, 150+ routes, 10,000+ happy trekkers.",
    url: "/about",
    images: [
      {
        url: "/img/landscape_background_small.jpg",
        width: 1200,
        height: 630,
        alt: "Get Tours Nepal — Himalayan trekking team",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Get Tours Nepal",
    description: "Expert Sherpa guides, 10,000+ trekkers guided, 150+ routes. Nepal's most trusted Himalayan adventure company.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
  },
};

export default async function AboutPage() {
  const [valuesData, milestonesData, statsData, leaders, siteConfig] = await Promise.all([
    getValues().catch(() => []),
    getMilestones().catch(() => []),
    getAboutStats().catch(() => []),
    getLeaders().catch(() => []),
    getSiteConfig().catch(() => null),
  ]);

  const guides = leaders.filter((l) => (l.category || "guide") === "guide");
  const teamMembers = leaders.filter((l) => l.category === "team");

  return (
    <AboutClient
      stats={statsData}
      valuesData={valuesData}
      milestonesData={milestonesData}
      guides={guides}
      teamMembers={teamMembers}
      siteConfig={siteConfig}
    />
  );
}
