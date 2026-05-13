"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import AdminShell from "../AdminShell";
import { EditButton, DeleteButton, CancelButton } from "../components/ActionButtons";
import {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  type APITestimonial,
} from "@/lib/api";
import { shouldUseUnoptimizedImage } from "@/lib/images";

type TestimonialForm = {
  name: string;
  location: string;
  text: string;
  imageFile: File | null;
  currentImage: string;
  rating: number;
  is_active: boolean;
  order: number;
};

const emptyForm: TestimonialForm = {
  name: "",
  location: "",
  text: "",
  imageFile: null,
  currentImage: "",
  rating: 5,
  is_active: true,
  order: 0,
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy transition";

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<APITestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<APITestimonial | null>(null);
  const [form, setForm] = useState<TestimonialForm>(emptyForm);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

  const load = useCallback(() => {
    if (!token) return;
    getTestimonials()
      .then(setItems)
      .catch(() => setError("Failed to load testimonials."))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setShowModal(true);
  }

  function openEdit(item: APITestimonial) {
    setEditing(item);
    setForm({
      name: item.name,
      location: item.location,
      text: item.text,
      imageFile: null,
      currentImage: item.image || "",
      rating: item.rating,
      is_active: item.is_active,
      order: item.order,
    });
    setError("");
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError("");
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("location", form.location);
      fd.append("text", form.text);
      fd.append("rating", String(form.rating));
      fd.append("is_active", String(form.is_active));
      fd.append("order", String(form.order));
      if (form.imageFile) fd.append("image_file", form.imageFile);

      if (editing) {
        await updateTestimonial(editing.id, fd, token);
      } else {
        await createTestimonial(fd, token);
      }
      setShowModal(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!token || !confirm("Delete this testimonial?")) return;
    try {
      await deleteTestimonial(id, token);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete.");
    }
  }

  const previewSrc = form.imageFile
    ? URL.createObjectURL(form.imageFile)
    : form.currentImage || null;

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-brand-navy">Testimonials</h2>
            <p className="text-sm text-gray-500 mt-0.5">{items.length} total</p>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 bg-brand-navy text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-brand-blue transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Testimonial
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-gray-200 border-t-brand-navy" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <svg className="w-12 h-12 text-gray-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-gray-400 font-medium">No testimonials yet.</p>
            <p className="text-gray-400 text-sm mt-1">Click &ldquo;Add Testimonial&rdquo; to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow"
              >
                {/* Top row */}
                <div className="flex items-start gap-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        unoptimized={shouldUseUnoptimizedImage(item.image)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg font-bold">
                        {item.name[0]}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-brand-navy text-sm">{item.name}</p>
                    <p className="text-gray-500 text-xs">{item.location}</p>
                    <div className="flex items-center gap-0.5 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-3 h-3 ${i < item.rating ? "text-brand-red" : "text-gray-200"}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    {!item.is_active && (
                      <span className="bg-gray-100 text-gray-500 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        Hidden
                      </span>
                    )}
                    <span className="text-[10px] text-gray-400">Order: {item.order}</span>
                  </div>
                </div>

                {/* Text */}
                <p className="text-gray-600 text-xs leading-relaxed line-clamp-3 italic">
                  &ldquo;{item.text}&rdquo;
                </p>

                {/* Actions */}
                <div className="flex gap-2 pt-1 border-t border-gray-50">
                  <EditButton onClick={() => openEdit(item)} className="flex-1 justify-center" />
                  <DeleteButton onClick={() => handleDelete(item.id)} className="flex-1 justify-center" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-brand-navy text-lg">
                {editing ? "Edit Testimonial" : "Add Testimonial"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Field label="Name *">
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={inputCls}
                    placeholder="Sarah Mitchell"
                  />
                </Field>
                <Field label="Location *">
                  <input
                    required
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className={inputCls}
                    placeholder="London, UK"
                  />
                </Field>
              </div>

              <Field label="Review Text *">
                <textarea
                  required
                  rows={4}
                  value={form.text}
                  onChange={(e) => setForm({ ...form, text: e.target.value })}
                  className={inputCls}
                  placeholder="Write the traveler's review..."
                />
              </Field>

              {/* Avatar Upload */}
              <Field label="Profile Photo">
                <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-brand-navy hover:bg-blue-50 transition-colors bg-gray-50">
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
                    <span className="text-sm text-green-700 font-medium">✓ {form.imageFile.name}</span>
                  ) : form.currentImage ? (
                    <span className="text-sm text-gray-500">Click to replace current photo</span>
                  ) : (
                    <>
                      <svg className="w-8 h-8 text-gray-300 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                      <span className="text-xs text-gray-400">Click to upload profile photo</span>
                    </>
                  )}
                </label>
                {previewSrc && (
                  <div className="mt-2 flex items-center gap-2">
                    <Image
                      src={previewSrc}
                      alt="Preview"
                      width={48}
                      height={48}
                      className="rounded-full object-cover ring-2 ring-gray-200"
                      unoptimized={Boolean(form.imageFile) || shouldUseUnoptimizedImage(previewSrc)}
                    />
                    <span className="text-xs text-gray-500">
                      {form.imageFile ? "New photo selected" : "Current photo"}
                    </span>
                  </div>
                )}
              </Field>

              <div className="grid grid-cols-3 gap-4">
                <Field label="Rating">
                  <select
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                    className={inputCls}
                  >
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>{r} Stars</option>
                    ))}
                  </select>
                </Field>
                <Field label="Display Order">
                  <input
                    type="number"
                    min={0}
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                    className={inputCls}
                  />
                </Field>
                <Field label="Visible">
                  <div className="flex items-center h-[38px]">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <div
                        onClick={() => setForm({ ...form, is_active: !form.is_active })}
                        className={`w-11 h-6 rounded-full transition-colors duration-200 relative cursor-pointer flex-shrink-0 ${form.is_active ? "bg-green-500" : "bg-gray-300"}`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${form.is_active ? "translate-x-5" : "translate-x-0"}`}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{form.is_active ? "Active" : "Hidden"}</span>
                    </label>
                  </div>
                </Field>
              </div>

              <div className="flex gap-3 pt-2">
                <CancelButton onClick={() => setShowModal(false)} />
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-brand-navy text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-brand-blue transition-colors disabled:opacity-60"
                >
                  {saving ? "Saving…" : editing ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
