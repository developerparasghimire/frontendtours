"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import MotionWrapper, { StaggerContainer, StaggerItem } from "@/components/shared/MotionWrapper";
import type { BlogPost } from "@/types";
import { shouldUseUnoptimizedImage } from "@/lib/images";
import BlogImagePlaceholder from "@/components/shared/BlogImagePlaceholder";
import { sanitizeHTML } from "@/lib/sanitize";
import { useTranslation } from "@/context/TranslationContext";
import { tr } from "@/lib/langContent";
import { getBlogFAQs, type APIBlogFAQ } from "@/lib/api";

export default function BlogDetailClient({
  post,
  related,
}: {
  post: BlogPost;
  related: BlogPost[];
}) {
  const { t, lang } = useTranslation();
  const [faqs, setFaqs] = useState<APIBlogFAQ[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    if (post.id) {
      getBlogFAQs(post.id).then(setFaqs).catch(() => {});
    }
  }, [post.id]);

  const tTitle = tr(post, lang, "title") || post.title;
  const tExcerpt = tr(post, lang, "excerpt") || post.excerpt;
  const tCategory = tr(post, lang, "category") || post.category;
  const tReadTime = tr(post, lang, "read_time") || post.readTime;
  const tContentRaw = tr(post, lang, "content");
  const contentToRender = tContentRaw || (Array.isArray(post.content) ? post.content.join("\n\n") : (post.content ?? ""));

  return (
    <div className="flex flex-col overflow-x-hidden">
      {/* ═══════════ HERO ═══════════ */}
      <section className="relative min-h-[380px] sm:min-h-[480px] flex items-end overflow-hidden">
        {/* Background: real image if available, dark gradient fallback */}
        {post.image ? (
          <>
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover object-center"
              unoptimized={shouldUseUnoptimizedImage(post.image)}
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/70 via-brand-navy/60 to-brand-navy/70" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/56 via-transparent to-brand-navy/22" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#0b1a16] via-[#0f211a] to-[#0d1a24]" />
        )}
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-brand-red via-brand-orange to-brand-red" />

        <div className="relative z-10 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-14 pt-20">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="bg-brand-red text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg uppercase tracking-wide">
              {tCategory}
            </span>
            <span className="text-white/70 text-sm">{post.date}</span>
            <span className="text-white/50 text-sm">·</span>
            <span className="text-white/70 text-sm">{tReadTime}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight mb-5">
            {tTitle}
          </h1>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold text-white backdrop-blur-sm">
              {post.author[0]}
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{post.author}</p>
              <p className="text-white/50 text-xs">{t("blog.travel_writer")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ CONTENT + SIDEBAR ═══════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">

          {/* Article Body */}
          <div className="lg:col-span-2">
            <MotionWrapper>
              {/* Excerpt lead */}
              <p className="text-lg sm:text-xl text-gray-700 font-medium leading-relaxed border-l-4 border-brand-red pl-5 mb-10">
                {tExcerpt}
              </p>

              {/* Article paragraphs */}
              {contentToRender && contentToRender.length > 0 && (() => {
                const raw = contentToRender;
                const isHTML = /<[a-z][\s\S]*>/i.test(raw);
                return isHTML ? (
                  <div
                    className="text-gray-700 text-base sm:text-lg leading-relaxed [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:text-brand-navy [&>h1]:mb-4 [&>h1]:mt-6 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-brand-navy [&>h2]:mb-3 [&>h2]:mt-5 [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:text-brand-navy [&>h3]:mb-2 [&>h3]:mt-4 [&>p]:mb-4 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-4 [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-4 [&>li]:mb-1.5 [&>blockquote]:border-l-4 [&>blockquote]:border-brand-red [&>blockquote]:pl-5 [&>blockquote]:italic [&>blockquote]:text-gray-600 [&>blockquote]:mb-4 [&>img]:max-w-full [&>img]:rounded-2xl [&>img]:my-6 [&>img]:shadow-md"
                    dangerouslySetInnerHTML={{ __html: sanitizeHTML(raw) }}
                  />
                ) : (
                  <div className="space-y-6 text-gray-700 text-base sm:text-lg leading-relaxed">
                    {raw.split(/\n\n+/).filter(Boolean).map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>
                );
              })()}
            </MotionWrapper>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <MotionWrapper delay={0.1}>
                <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-brand-navy mr-1">{t("blog.tags")}</span>
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full hover:bg-brand-navy hover:text-white transition-colors cursor-default"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </MotionWrapper>
            )}

            {/* FAQ Section */}
            {faqs.length > 0 && (
              <MotionWrapper delay={0.12}>
                <div className="mt-12 pt-8 border-t border-gray-100">
                  <h2 className="text-xl sm:text-2xl font-bold text-brand-navy mb-6">{t("tour.faq")}</h2>
                  <div className="space-y-3">
                    {faqs.map((faq, i) => {
                      const tQuestion = (faq.translations?.[lang]?.question) || faq.question;
                      const tAnswer = (faq.translations?.[lang]?.answer) || faq.answer;
                      const isOpen = openFaq === i;
                      return (
                        <div key={faq.id} className="rounded-xl border border-gray-200 overflow-hidden">
                          <button
                            onClick={() => setOpenFaq(isOpen ? null : i)}
                            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                          >
                            <span className="font-semibold text-brand-navy text-sm sm:text-base pr-4">{tQuestion}</span>
                            <span className={`flex-shrink-0 w-6 h-6 rounded-full bg-brand-navy text-white flex items-center justify-center text-sm font-bold transition-transform ${isOpen ? "rotate-45" : ""}`}>+</span>
                          </button>
                          {isOpen && (
                            <div className="px-5 pb-4 text-gray-600 text-sm sm:text-base leading-relaxed border-t border-gray-100 pt-3">
                              {tAnswer}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </MotionWrapper>
            )}

            {/* Author card */}
            <MotionWrapper delay={0.15}>
              <div className="mt-12 bg-gradient-to-br from-brand-navy to-brand-blue rounded-2xl p-6 sm:p-8 flex items-start gap-5">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-extrabold text-white flex-shrink-0 backdrop-blur-sm">
                  {post.author[0]}
                </div>
                <div>
                  <p className="text-white font-bold text-lg">{post.author}</p>
                  <p className="text-white/60 text-sm mb-3">{t("blog.travel_writer_role")}</p>
                  <p className="text-white/80 text-sm leading-relaxed">
                    {t("blog.travel_writer_bio")}
                  </p>
                </div>
              </div>
            </MotionWrapper>

            {/* Back link */}
            <MotionWrapper delay={0.2}>
              <div className="mt-10">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 text-brand-blue font-semibold hover:text-brand-navy transition-colors group"
                >
                  <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  {t("blog.back")}
                </Link>
              </div>
            </MotionWrapper>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8">

            {/* CTA card */}
            <div className="sticky top-24">
              <MotionWrapper delay={0.1}>
                <div className="bg-brand-navy rounded-2xl p-6 text-center mb-8">
                  <p className="text-white/60 text-xs uppercase tracking-widest mb-2">{t("blog.ready")}</p>
                  <h3 className="text-white font-extrabold text-xl mb-3">{t("blog.book_adventure")}</h3>
                  <p className="text-white/70 text-sm mb-5 leading-relaxed">
                    {t("blog.book_adventure_desc")}
                  </p>
                  <Link
                    href="/tours"
                    className="block w-full bg-brand-red hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg"
                  >
                    {t("blog.browse_tours")}
                  </Link>
                  <Link
                    href="/contact"
                    className="block w-full mt-3 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
                  >
                    {t("common.contact")}
                  </Link>
                </div>
              </MotionWrapper>

              {/* Related posts */}
              {related.length > 0 && (
                <MotionWrapper delay={0.2}>
                  <h3 className="text-base font-bold text-brand-navy mb-4 uppercase tracking-wider">{t("blog.related_articles")}</h3>
                  <StaggerContainer className="space-y-4" staggerDelay={0.08}>
                    {related.map((r) => (
                      <StaggerItem key={r.id}>
                        <Link href={`/blog/${r.id}`} className="flex gap-4 group">
                          <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                            {r.image ? (
                              <Image
                                src={r.image}
                                alt={r.title}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                sizes="80px"
                                unoptimized={shouldUseUnoptimizedImage(r.image)}
                              />
                            ) : (
                              <BlogImagePlaceholder title={r.title} compact />
                            )}
                          </div>
                          <div className="flex-1">
                            <span className="text-xs text-brand-blue font-semibold">{tr(r, lang, "category") || r.category}</span>
                            <p className="text-sm font-bold text-brand-navy group-hover:text-brand-blue transition-colors line-clamp-2 mt-0.5">
                              {tr(r, lang, "title") || r.title}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">{r.readTime}</p>
                          </div>
                        </Link>
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                </MotionWrapper>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
