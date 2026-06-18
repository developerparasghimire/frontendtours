"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import MotionWrapper from "@/components/shared/MotionWrapper";
import BlogCard from "@/components/shared/BlogCard";
import { getBlogPosts, type APIBlogPost } from "@/lib/api";
import PageHero from "@/components/sections/PageHero";
import ZoomSection from "@/components/ui/ZoomSection";
import { shouldUseUnoptimizedImage } from "@/lib/images";
import BlogImagePlaceholder from "@/components/shared/BlogImagePlaceholder";
import { sectionImages } from "@/lib/sectionImages";
import { useTranslation } from "@/context/TranslationContext";
import { tr } from "@/lib/langContent";

type Post = { id: string; slug: string; title: string; excerpt: string; image: string; date: string; author: string; category: string; readTime: string; translations?: Record<string, Record<string, string>> };

export default function ClientBlogPage() {
  const [apiPosts, setApiPosts] = useState<APIBlogPost[] | null>(null);
  const { lang } = useTranslation();

  useEffect(() => {
    getBlogPosts().then(setApiPosts).catch(() => setApiPosts([]));
  }, []);

  const allPosts: Post[] =
    apiPosts
      ? apiPosts.map((p) => ({
          id: p.slug,
          slug: p.slug,
          title: p.title,
          excerpt: p.excerpt,
          image: p.image || "",
          date: p.publish_date,
          author: p.author,
          category: p.category,
          readTime: p.read_time,
          translations: p.translations,
        }))
      : [];

  const loading = apiPosts === null;
  const featured = allPosts[0];
  const rest = allPosts.slice(1);

  return (
    <div className="flex flex-col overflow-x-hidden bg-gray-50">
      {/* ═══════════ HERO ═══════════ */}
      <PageHero
        title="Travel Blog"
        subtitle="Stories & Guides"
        description="Trekking guides, cultural stories, and inspiration for your next Nepal adventure."
        accentColor="brand-green"
        backgroundImage={sectionImages.blogCta}
        compact
      />

      {loading ? (
        <div className="flex justify-center py-32">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-red border-t-transparent" />
        </div>
      ) : allPosts.length === 0 ? (
        <div className="text-center py-32">
          <p className="text-gray-400 text-6xl mb-4">📝</p>
          <p className="text-gray-500 text-lg">No posts available yet. Check back soon!</p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-20">

          {/* ── Featured post ── */}
          {featured && (
            <Link href={`/blog/${featured.slug}`} className="group mb-14 block rounded-3xl overflow-hidden bg-white shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="relative aspect-[16/10] lg:aspect-auto lg:min-h-[400px] overflow-hidden">
                  {featured.image ? (
                    <Image
                      src={featured.image}
                      alt={featured.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      unoptimized={shouldUseUnoptimizedImage(featured.image)}
                      priority
                    />
                  ) : (
                    <BlogImagePlaceholder title={featured.title} />
                  )}
                  <span className="absolute top-4 left-4 bg-brand-red text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    Featured
                  </span>
                </div>
                <div className="flex flex-col justify-center p-8 sm:p-12">
                  <div className="flex items-center gap-3 mb-4 text-xs text-slate-500 font-medium">
                    <span className="bg-slate-100 text-brand-navy px-3 py-1 rounded-full font-semibold">{tr(featured, lang, "category") || featured.category}</span>
                    <span>·</span>
                    <time>{featured.date}</time>
                    <span>·</span>
                    <span>{tr(featured, lang, "read_time") || featured.readTime}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy mb-4 leading-tight group-hover:text-brand-red transition-colors duration-300">
                    {tr(featured, lang, "title") || featured.title}
                  </h2>
                  <p className="text-slate-600 text-base leading-relaxed mb-8 line-clamp-3">{tr(featured, lang, "excerpt") || featured.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700">By {featured.author}</span>
                    <span className="inline-flex items-center gap-2 text-sm font-bold text-brand-red">
                      Read Article
                      <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* ── Post count ── */}
          {rest.length > 0 && (
            <div className="flex items-center gap-4 mb-8">
              <h3 className="text-xl font-bold text-brand-navy">More Stories</h3>
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-sm text-slate-500 font-medium">{rest.length} article{rest.length !== 1 ? "s" : ""}</span>
            </div>
          )}

          {/* ── Grid ── */}
          {rest.length > 0 && (
            <ZoomSection>
              <div className={`grid gap-6 ${
                rest.length === 1
                  ? "grid-cols-1 max-w-md mx-auto"
                  : rest.length === 2
                  ? "grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              }`}>
                {rest.map((post) => (
                  <BlogCard key={post.slug} post={post} />
                ))}
              </div>
            </ZoomSection>
          )}
        </div>
      )}

      <section
        className="parallax-bg relative py-20 sm:py-28 overflow-hidden"
        style={{
          backgroundImage: `url('${sectionImages.blogCta}')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/70 via-brand-navy/60 to-brand-navy/70" />
        <MotionWrapper variant="scale-up" className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
            Ready to Experience These Stories Yourself?
          </h2>
          <p className="text-gray-300 text-base sm:text-lg mb-6 sm:mb-8 max-w-xl mx-auto">
            Talk with Get Tours and start planning the Nepal journey behind your next favorite travel story.
          </p>
          <a
            href="/contact"
            className="group inline-flex items-center gap-2 bg-brand-red text-white font-semibold px-8 py-3.5 rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            Contact Us
            <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </MotionWrapper>
      </section>
    </div>
  );
}
