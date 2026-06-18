import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/api";
import BlogDetailClient from "./BlogDetailClient";
import { safeJsonLd } from "@/lib/jsonld";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://gettours.com.np";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const post = await getBlogPostBySlug(id);
    return {
      title: `${post.title} — Get Tours Nepal Blog`,
      description: post.excerpt,
      alternates: { canonical: `${SITE_URL}/blog/${post.slug}` },
      openGraph: {
        title: post.title,
        description: post.excerpt,
        images: post.image ? [{ url: post.image }] : [],
        type: "article",
        publishedTime: post.publish_date,
        authors: [post.author],
      },
    };
  } catch {
    return { title: "Blog Post Not Found" };
  }
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let post;
  let allPosts;
  try {
    post = await getBlogPostBySlug(id);
    allPosts = await getBlogPosts().catch(() => []);
  } catch {
    notFound();
  }

  const related = allPosts
    .filter((p) => p.slug !== post.slug && p.category === post.category)
    .slice(0, 3);
  const padded =
    related.length >= 2
      ? related
      : [
          ...related,
          ...allPosts
            .filter((p) => p.slug !== post.slug && !related.includes(p))
            .slice(0, 3 - related.length),
        ];

  const legacyPost = {
    id: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    image: post.image || "",
    date: post.publish_date,
    author: post.author,
    category: post.category,
    readTime: post.read_time,
    content: post.content ? post.content.split(/\n\n+/).filter(Boolean) : [],
    tags: post.tags ? post.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    translations: post.translations,
  };
  const legacyRelated = padded.map((p) => ({
    id: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    image: p.image || "",
    date: p.publish_date,
    author: p.author,
    category: p.category,
    readTime: p.read_time,
    content: [],
    tags: [],
    translations: p.translations,
  }));

  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.image || undefined,
    datePublished: post.publish_date,
    dateModified: post.updated_at,
    author: { "@type": "Person", name: post.author },
    publisher: {
      "@type": "Organization",
      name: "Get Tours Nepal",
      url: SITE_URL,
    },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(blogJsonLd) }}
      />
      <BlogDetailClient post={legacyPost} related={legacyRelated} />
    </>
  );
}
