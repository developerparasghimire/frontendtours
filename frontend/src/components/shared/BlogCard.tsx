"use client";

import Link from "next/link";
import Image from "next/image";
import type { BlogPost } from "@/types";
import { shouldUseUnoptimizedImage } from "@/lib/images";
import BlogImagePlaceholder from "@/components/shared/BlogImagePlaceholder";

function getBlogDateParts(dateLabel: string) {
  const parsed = new Date(dateLabel);

  if (Number.isNaN(parsed.getTime())) {
    return {
      month: "Story",
      day: "",
      year: dateLabel,
    };
  }

  return {
    month: parsed.toLocaleString("en-US", { month: "short" }),
    day: parsed.toLocaleString("en-US", { day: "2-digit" }),
    year: parsed.toLocaleString("en-US", { year: "numeric" }),
  };
}

export default function BlogCard({ post }: { post: BlogPost & { slug: string } }) {
  const dateParts = getBlogDateParts(post.date);

  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full">
      <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-red/10 group">
        <div className="relative aspect-[16/10] overflow-hidden">
          {post.image ? (
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              loading="lazy"
              quality={72}
              unoptimized={shouldUseUnoptimizedImage(post.image)}
            />
          ) : (
            <BlogImagePlaceholder title={post.title} />
          )}
          <div className="absolute left-4 top-4">
            <span className="rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-brand-navy shadow-sm">
              {post.category}
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-6">
          <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
            <time dateTime={post.date} className="flex items-center gap-1.5 font-medium">
              <svg className="w-4 h-4 text-brand-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {post.date}
            </time>
            <span className="flex items-center gap-1.5 font-medium">
              <svg className="w-4 h-4 text-brand-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {post.readTime}
            </span>
          </div>

          <h3 className="mb-3 text-xl font-bold leading-tight text-brand-navy group-hover:text-brand-red transition-colors duration-300">
            {post.title}
          </h3>
          
          <p className="mb-6 line-clamp-2 text-sm text-slate-600 flex-1">
            {post.excerpt}
          </p>

          <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
            <span className="text-sm font-semibold text-brand-navy">By {post.author}</span>
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-red">
              Read More
              <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
