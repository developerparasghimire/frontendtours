import type { MetadataRoute } from "next";
import { getTours, getEvents, getBlogPosts } from "@/lib/api";
import { LOCALE_LIST } from "@/routing";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://gettoursnepal.com";

// Build all locale variants of a path
function localeUrls(path: string, opts: { priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }): MetadataRoute.Sitemap {
  return LOCALE_LIST.map((locale) => ({
    url: locale === "en" ? `${SITE_URL}${path}` : `${SITE_URL}/${locale}${path}`,
    lastModified: new Date(),
    changeFrequency: opts.freq,
    priority: locale === "en" ? opts.priority : opts.priority - 0.05,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    ...localeUrls("/",              { priority: 1.0,  freq: "daily"   }),
    ...localeUrls("/tours",         { priority: 0.9,  freq: "daily"   }),
    ...localeUrls("/events",        { priority: 0.85, freq: "daily"   }),
    ...localeUrls("/about",         { priority: 0.6,  freq: "monthly" }),
    ...localeUrls("/blog",          { priority: 0.7,  freq: "weekly"  }),
    ...localeUrls("/contact",       { priority: 0.5,  freq: "monthly" }),
    ...localeUrls("/faqs",          { priority: 0.5,  freq: "monthly" }),
    ...localeUrls("/login",         { priority: 0.4,  freq: "monthly" }),
    ...localeUrls("/register",      { priority: 0.4,  freq: "monthly" }),
    ...localeUrls("/privacy",       { priority: 0.3,  freq: "yearly"  }),
    ...localeUrls("/terms",         { priority: 0.3,  freq: "yearly"  }),
    ...localeUrls("/booking-policy",{ priority: 0.3,  freq: "yearly"  }),
  ];

  // Dynamic tour pages (all locale variants)
  let tourEntries: MetadataRoute.Sitemap = [];
  try {
    const tours = await getTours();
    for (const tour of tours) {
      tourEntries.push(...localeUrls(`/tours/${tour.slug}`, { priority: 0.8, freq: "weekly" }).map((e) => ({
        ...e,
        lastModified: new Date(tour.updated_at),
      })));
    }
  } catch { /* API unavailable */ }

  // Dynamic event pages
  let eventEntries: MetadataRoute.Sitemap = [];
  try {
    const events = await getEvents();
    for (const event of events) {
      eventEntries.push(...localeUrls(`/events/${event.slug}`, { priority: 0.7, freq: "weekly" }).map((e) => ({
        ...e,
        lastModified: new Date(event.updated_at),
      })));
    }
  } catch { /* API unavailable */ }

  // Dynamic blog pages (English only — blog content is English)
  let blogEntries: MetadataRoute.Sitemap = [];
  try {
    const posts = await getBlogPosts();
    blogEntries = posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch { /* API unavailable */ }

  return [...staticEntries, ...tourEntries, ...eventEntries, ...blogEntries];
}
