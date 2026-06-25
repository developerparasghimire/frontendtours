"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import AdminShell from "../AdminShell";
import { EditButton, DeleteButton, CancelButton } from "../components/ActionButtons";
import RichTextEditor from "../components/RichTextEditor";
import {
  getBlogPosts,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  getBlogFAQs,
  createBlogFAQ,
  updateBlogFAQ,
  deleteBlogFAQ,
  type APIBlogPost,
  type APIBlogFAQ,
} from "@/lib/api";
import { shouldUseUnoptimizedImage } from "@/lib/images";

const CATEGORIES = [
  "Travel Tips",
  "Trekking Guide",
  "Culture",
  "Wildlife",
  "Packing Guide",
  "Spiritual",
];

type BlogForm = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageFile: File | null;
  currentImage: string;
  author: string;
  category: string;
  read_time: string;
  tags: string;
  is_published: boolean;
};

const emptyForm: BlogForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  imageFile: null,
  currentImage: "",
  author: "Get Tours Team",
  category: "Travel Tips",
  read_time: "5 min read",
  tags: "",
  is_published: true,
};

function toSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<APIBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<APIBlogPost | null>(null);
  const [form, setForm] = useState<BlogForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [faqModalPost, setFaqModalPost] = useState<APIBlogPost | null>(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

  const loadPosts = useCallback(() => {
    setLoading(true);
    getBlogPosts()
      .then(setPosts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setShowModal(true);
  }

  function openEdit(post: APIBlogPost) {
    setEditing(post);
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      imageFile: null,
      currentImage: post.image || "",
      author: post.author,
      category: post.category,
      read_time: post.read_time,
      tags: post.tags,
      is_published: post.is_published,
    });
    setError("");
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setError("");

    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("slug", form.slug || toSlug(form.title));
      fd.append("excerpt", form.excerpt);
      fd.append("content", form.content);
      fd.append("author", form.author);
      fd.append("category", form.category);
      fd.append("read_time", form.read_time);
      fd.append("tags", form.tags);
      fd.append("is_published", String(form.is_published));
      if (form.imageFile) fd.append("image_file", form.imageFile);

      if (editing) {
        await updateBlogPost(editing.slug, fd, token);
      } else {
        await createBlogPost(fd, token);
      }
      setShowModal(false);
      loadPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save post. Check all fields and try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(slug: string) {
    if (!token || !confirm("Delete this blog post?")) return;
    try {
      await deleteBlogPost(slug, token);
      loadPosts();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete post.");
    }
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-brand-navy">
            Blog Posts
          </h2>
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-brand-navy text-white text-sm font-semibold rounded-lg hover:bg-brand-blue transition-colors"
          >
            + New Post
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-navy" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
            <p className="text-gray-500">No blog posts yet. Create your first one!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Thumbnail */}
                  <div className="w-full sm:w-24 h-32 sm:h-24 rounded-lg overflow-hidden flex-shrink-0 relative bg-gray-100">
                    {post.image ? (
                      <Image src={post.image} alt={post.title} fill className="object-cover" sizes="96px" unoptimized={shouldUseUnoptimizedImage(post.image)} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v14.25a1.5 1.5 0 001.5 1.5z" /></svg>
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-brand-navy text-sm sm:text-base line-clamp-1">{post.title}</h3>
                          {!post.is_published && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium flex-shrink-0">Draft</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{post.category} &middot; {post.author} &middot; {post.publish_date}</p>
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0">{post.read_time}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1.5 line-clamp-2">{post.excerpt}</p>
                    {post.tags && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {post.tags.split(",").slice(0, 4).map((tag) => tag.trim()).filter(Boolean).map((tag) => (
                          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">#{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                  <button onClick={() => setFaqModalPost(post)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    FAQ
                  </button>
                  <EditButton onClick={() => openEdit(post)} className="flex-1 justify-center" />
                  <DeleteButton onClick={() => handleDelete(post.slug)} className="flex-1 justify-center" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-lg font-bold text-brand-navy mb-4">
              {editing ? "Edit Post" : "Create Post"}
            </h3>
            {error && (
              <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setForm({ ...form, title, slug: editing ? form.slug : toSlug(title) });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-navy focus:border-transparent outline-none text-sm"
                />
              </div>
              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  required
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="auto-generated-from-title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-navy focus:border-transparent outline-none text-sm font-mono"
                />
              </div>
              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                <textarea required rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-navy focus:border-transparent outline-none text-sm" />
              </div>
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-brand-blue hover:bg-blue-50 transition-colors bg-gray-50">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      setForm({ ...form, imageFile: file });
                    }}
                  />
                  {form.imageFile ? (
                    <span className="text-sm text-green-700 font-medium px-4 text-center">✓ {form.imageFile.name}</span>
                  ) : form.currentImage ? (
                    <span className="text-xs text-gray-500 px-4 text-center">Click to replace current image</span>
                  ) : (
                    <>
                      <svg className="w-8 h-8 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                      <span className="text-xs text-gray-500">Click to upload cover image</span>
                    </>
                  )}
                </label>
                {(form.imageFile || form.currentImage) && (
                  <div className="mt-2 relative w-full h-28 rounded-lg overflow-hidden border border-gray-200">
                    <Image
                      src={form.imageFile ? URL.createObjectURL(form.imageFile) : form.currentImage}
                      alt="Preview"
                      fill
                      className="object-cover"
                      sizes="400px"
                      unoptimized={Boolean(form.imageFile) || shouldUseUnoptimizedImage(form.currentImage)}
                    />
                    {form.currentImage && !form.imageFile && (
                      <span className="absolute bottom-1 left-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded">Current image</span>
                    )}
                  </div>
                )}
              </div>
              {/* Author & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                  <input required value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-navy focus:border-transparent outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-navy focus:border-transparent outline-none text-sm bg-white">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              {/* Read Time & Tags */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Read Time</label>
                  <input value={form.read_time} onChange={(e) => setForm({ ...form, read_time: e.target.value })} placeholder="5 min read" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-navy focus:border-transparent outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                  <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="Nepal, Trekking, Travel" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-navy focus:border-transparent outline-none text-sm" />
                </div>
              </div>
              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content <span className="text-gray-400 font-normal text-xs">(rich text — supports bold, headings, lists & image upload)</span>
                </label>
                <RichTextEditor
                  value={form.content}
                  onChange={(html) => setForm((f) => ({ ...f, content: html }))}
                  token={token}
                  placeholder="Write your blog content here..."
                  minHeight="220px"
                />
              </div>
              {/* Published */}
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="rounded" />
                Published (visible to public)
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <CancelButton onClick={() => setShowModal(false)} />
                <button type="submit" disabled={saving} className="px-4 py-2 bg-brand-navy text-white text-sm font-semibold rounded-lg hover:bg-brand-blue transition-colors disabled:opacity-50">
                  {saving ? "Saving..." : editing ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FAQ Modal */}
      {faqModalPost && (
        <BlogFaqModal
          post={faqModalPost}
          token={token}
          onClose={() => setFaqModalPost(null)}
        />
      )}
    </AdminShell>
  );
}

/* ═══════════════════ BLOG FAQ MODAL ═══════════════════ */
function parseBulkFAQs(text: string): { question: string; answer: string }[] {
  const blocks = text.split(/\n\s*\n/).filter((b) => b.trim());
  const results: { question: string; answer: string }[] = [];
  for (const block of blocks) {
    const lines = block.trim().split("\n");
    let question = "";
    const answerLines: string[] = [];
    for (const line of lines) {
      if (/^Q[:.)\s]/i.test(line) && !question) {
        question = line.replace(/^Q[:.)\s]+/i, "").trim();
      } else if (/^A[:.)\s]/i.test(line)) {
        answerLines.push(line.replace(/^A[:.)\s]+/i, "").trim());
      } else if (answerLines.length > 0 && line.trim()) {
        answerLines.push(line.trim());
      }
    }
    const answer = answerLines.filter(Boolean).join(" ").trim();
    if (question && answer) results.push({ question, answer });
  }
  return results;
}

function BlogFaqModal({ post, token, onClose }: { post: APIBlogPost; token: string | null; onClose: () => void }) {
  const [faqs, setFaqs] = useState<APIBlogFAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<APIBlogFAQ | null>(null);
  const [form, setForm] = useState({ question: "", answer: "", order: 0 });
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkSaving, setBulkSaving] = useState(false);
  const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getBlogFAQs(post.slug);
      setFaqs(data);
    } catch { /* empty */ } finally {
      setLoading(false);
    }
  }, [post.slug]);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => { setForm({ question: "", answer: "", order: faqs.length }); setEditing(null); };

  const handleSave = async () => {
    if (!token || !form.question.trim() || !form.answer.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await updateBlogFAQ(editing.id, { question: form.question, answer: form.answer, order: form.order }, token);
      } else {
        await createBlogFAQ({ post: post.id, question: form.question, answer: form.answer, order: form.order }, token);
      }
      resetForm();
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to save FAQ");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!token || !confirm("Delete this FAQ?")) return;
    try {
      await deleteBlogFAQ(id, token);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete FAQ");
    }
  };

  const startEdit = (faq: APIBlogFAQ) => {
    setEditing(faq);
    setBulkMode(false);
    setForm({ question: faq.question, answer: faq.answer, order: faq.order });
  };

  const parsedFAQs = parseBulkFAQs(bulkText);

  const handleBulkImport = async () => {
    if (!token || parsedFAQs.length === 0) return;
    setBulkSaving(true);
    try {
      let order = faqs.length;
      for (const item of parsedFAQs) {
        await createBlogFAQ({ post: post.id, question: item.question, answer: item.answer, order: order++ }, token);
      }
      setBulkText("");
      setBulkMode(false);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to import FAQs");
    } finally {
      setBulkSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-gray-100 z-10">
          <div>
            <h3 className="text-base font-bold text-brand-navy">FAQ Management</h3>
            <p className="text-xs text-gray-400 truncate max-w-[280px]">{post.title}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors text-lg">×</button>
        </div>

        <div className="p-6 space-y-6">
          {loading ? (
            <p className="text-gray-400 text-center py-4">Loading…</p>
          ) : faqs.length > 0 ? (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-brand-navy">Current FAQs ({faqs.length})</h4>
              {faqs.map((faq) => (
                <div key={faq.id} className={`rounded-xl border p-3 ${editing?.id === faq.id ? "border-purple-300 bg-purple-50" : "border-gray-100 bg-gray-50"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-brand-navy line-clamp-2">{faq.question}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{faq.answer}</p>
                      <p className="text-[10px] text-gray-400 mt-1">Order: {faq.order}</p>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button onClick={() => startEdit(faq)} className="text-purple-600 hover:text-purple-800 text-xs font-semibold px-2 py-1 rounded-lg hover:bg-purple-100 transition-colors">Edit</button>
                      <button onClick={() => handleDelete(faq.id)} className="text-red-500 hover:text-red-700 text-xs font-semibold px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">×</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-2">No FAQs yet. Add one below.</p>
          )}

          <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{editing ? "Edit FAQ" : "Add FAQ"}</p>
              {!editing && (
                <div className="flex gap-0.5 bg-gray-200 rounded-lg p-0.5">
                  <button onClick={() => setBulkMode(false)} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${!bulkMode ? "bg-white text-brand-navy shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>Single</button>
                  <button onClick={() => setBulkMode(true)} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${bulkMode ? "bg-white text-brand-navy shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>Bulk Import</button>
                </div>
              )}
            </div>

            {!editing && bulkMode ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Paste multiple FAQs</label>
                  <p className="text-[11px] text-gray-400 mb-2">
                    Each FAQ must be separated by a blank line. Use <code className="bg-gray-200 px-1 rounded">Q:</code> for the question and <code className="bg-gray-200 px-1 rounded">A:</code> for the answer.
                  </p>
                  <textarea
                    rows={10}
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    placeholder={"Q: What topics does this article cover?\nA: This article covers travel tips, local culture, and must-see attractions.\n\nQ: Is the information up to date?\nA: Yes, all content is regularly reviewed and updated."}
                    className={`${inputCls} font-mono text-xs leading-relaxed`}
                  />
                </div>
                {parsedFAQs.length > 0 && (
                  <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                    <p className="text-xs font-semibold text-green-700 mb-1.5">{parsedFAQs.length} FAQ{parsedFAQs.length !== 1 ? "s" : ""} detected</p>
                    <ul className="space-y-0.5">
                      {parsedFAQs.map((f, i) => (
                        <li key={i} className="text-xs text-green-600 truncate">• {f.question}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {bulkText.trim() && parsedFAQs.length === 0 && (
                  <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 border border-amber-100">No FAQs detected. Make sure each block starts with <code className="bg-amber-100 px-1 rounded">Q:</code> and has an <code className="bg-amber-100 px-1 rounded">A:</code> line, with blank lines between each FAQ.</p>
                )}
                <button
                  onClick={handleBulkImport}
                  disabled={bulkSaving || parsedFAQs.length === 0}
                  className="px-4 py-2 bg-purple-600 text-white text-xs font-semibold rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {bulkSaving ? "Importing…" : `Import ${parsedFAQs.length} FAQ${parsedFAQs.length !== 1 ? "s" : ""}`}
                </button>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Question</label>
                  <input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} placeholder="e.g. Is this article suitable for beginners?" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Answer</label>
                  <textarea rows={3} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} placeholder="Provide a clear, helpful answer…" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Display Order <span className="text-gray-400 font-normal">(lower = first)</span></label>
                  <input type="number" min={0} value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} className={`${inputCls} w-24`} />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSave} disabled={saving || !form.question.trim() || !form.answer.trim()} className="px-4 py-2 bg-purple-600 text-white text-xs font-semibold rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50">
                    {saving ? "Saving…" : editing ? "Update FAQ" : "Add FAQ"}
                  </button>
                  {editing && (
                    <button onClick={resetForm} className="px-4 py-2 text-gray-500 text-xs font-semibold rounded-lg hover:bg-gray-100 transition-colors">
                      Cancel
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
