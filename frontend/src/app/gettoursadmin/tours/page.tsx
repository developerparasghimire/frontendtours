"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import AdminShell from "../AdminShell";
import { EditButton, DeleteButton, CancelButton } from "../components/ActionButtons";
import RichTextEditor from "../components/RichTextEditor";
import {
  getTours,
  createTour,
  updateTour,
  deleteTour,
  type APITour,
} from "@/lib/api";
import { shouldUseUnoptimizedImage } from "@/lib/images";

type TourForm = {
  title: string;
  slug: string;
  description: string;
  long_description: string;
  destination: string;
  imageFile: File | null;
  currentImage: string;
  base_price: string;
  currency: string;
  duration_days: number;
  max_capacity: number;
  category: string;
  difficulty: string;
  rating: string;
  badge: string;
  highlights: string;
  includes: string;
  galleryFiles: File[];
  currentGallery: string[];
  is_active: boolean;
  is_latest: boolean;
};

const CATEGORIES = ["Adventure", "Cultural", "Trekking", "Wildlife", "Spiritual", "Day Trip"];
const DIFFICULTIES = ["Easy", "Moderate", "Challenging", "Extreme"];

const emptyForm: TourForm = {
  title: "",
  slug: "",
  description: "",
  long_description: "",
  destination: "Nepal",
  imageFile: null,
  currentImage: "",
  base_price: "",
  currency: "USD",
  duration_days: 1,
  max_capacity: 10,
  category: "Adventure",
  difficulty: "Moderate",
  rating: "4.5",
  badge: "",
  highlights: "",
  includes: "",
  galleryFiles: [],
  currentGallery: [],
  is_active: true,
  is_latest: false,
};

export default function AdminToursPage() {
  const [tours, setTours] = useState<APITour[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<APITour | null>(null);
  const [form, setForm] = useState<TourForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

  const loadTours = useCallback(() => {
    getTours()
      .then(setTours)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadTours();
  }, [loadTours]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setShowModal(true);
  }

  function openEdit(tour: APITour) {
    setEditing(tour);
    setForm({
      title: tour.title,
      slug: tour.slug,
      description: tour.description,
      long_description: tour.long_description || "",
      destination: tour.destination,
      imageFile: null,
      currentImage: tour.image || "",
      base_price: tour.base_price,
      currency: tour.currency,
      duration_days: tour.duration_days,
      max_capacity: tour.max_capacity,
      category: tour.category || "Adventure",
      difficulty: tour.difficulty || "Moderate",
      rating: tour.rating ? String(tour.rating) : "4.5",
      badge: tour.badge || "",
      highlights: tour.highlights?.length ? tour.highlights.join("\n") : "",
      includes: tour.includes?.length ? tour.includes.join("\n") : "",
      galleryFiles: [],
      currentGallery: tour.gallery || [],
      is_active: tour.is_active,
      is_latest: tour.is_latest,
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
      fd.append("slug", form.slug);
      fd.append("description", form.description);
      fd.append("long_description", form.long_description);
      fd.append("destination", form.destination);
      fd.append("base_price", form.base_price);
      fd.append("currency", form.currency);
      fd.append("duration_days", String(form.duration_days));
      fd.append("max_capacity", String(form.max_capacity));
      fd.append("category", form.category);
      fd.append("difficulty", form.difficulty);
      fd.append("rating", form.rating);
      fd.append("badge", form.badge);
      fd.append("is_active", String(form.is_active));
      fd.append("is_latest", String(form.is_latest));
      if (form.imageFile) fd.append("image_file", form.imageFile);

      const highlights = form.highlights.split("\n").map(s => s.trim()).filter(Boolean);
      fd.append("highlights", JSON.stringify(highlights));
      const includes = form.includes.split("\n").map(s => s.trim()).filter(Boolean);
      fd.append("includes", JSON.stringify(includes));
      fd.append("gallery", JSON.stringify(form.currentGallery));
      for (const file of form.galleryFiles) {
        fd.append("gallery_files", file);
      }

      if (editing) {
        await updateTour(editing.slug, fd, token);
      } else {
        await createTour(fd, token);
      }
      setShowModal(false);
      loadTours();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save tour. Check all fields and try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(slug: string) {
    if (!token || !confirm("Are you sure you want to delete this tour?")) return;
    try {
      await deleteTour(slug, token);
      loadTours();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete tour.");
    }
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-brand-navy">Tours Management</h2>
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-brand-navy text-white text-sm font-semibold rounded-lg hover:bg-brand-blue transition-colors"
          >
            + Add Tour
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-navy" />
          </div>
        ) : tours.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
            <p className="text-gray-500">No tours found. Create one!</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 text-left">Tour</th>
                    <th className="px-4 py-3 text-left">Destination</th>
                    <th className="px-4 py-3 text-left">Category</th>
                    <th className="px-4 py-3 text-right">Price</th>
                    <th className="px-4 py-3 text-center">Days</th>
                    <th className="px-4 py-3 text-center">Difficulty</th>
                    <th className="px-4 py-3 text-center">Bookings</th>
                    <th className="px-4 py-3 text-center">Active</th>
                    <th className="px-4 py-3 text-center">Latest</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tours.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {t.image ? (
                            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 relative">
                              <Image src={t.image} alt={t.title} fill className="object-cover" sizes="40px" unoptimized={shouldUseUnoptimizedImage(t.image)} />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v14.25a1.5 1.5 0 001.5 1.5z" /></svg>
                            </div>
                          )}
                          <span className="font-medium text-brand-navy">{t.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{t.destination}</td>
                      <td className="px-4 py-3 text-gray-600">{t.category || "—"}</td>
                      <td className="px-4 py-3 text-right">USD {Number(t.base_price).toLocaleString()}</td>
                      <td className="px-4 py-3 text-center">{t.duration_days}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          t.difficulty === "Easy" ? "bg-green-100 text-green-700" :
                          t.difficulty === "Moderate" ? "bg-yellow-100 text-yellow-700" :
                          t.difficulty === "Challenging" ? "bg-orange-100 text-orange-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {t.difficulty || "Moderate"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          (t.booking_count ?? 0) > 0 ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
                        }`}>
                          {t.booking_count ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${t.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {t.is_active ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${t.is_latest ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-400"}`}>
                          {t.is_latest ? "✓" : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <EditButton onClick={() => openEdit(t)} />
                          <DeleteButton onClick={() => handleDelete(t.slug)} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {tours.map((t) => (
                <div key={t.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    {t.image ? (
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 relative">
                        <Image src={t.image} alt={t.title} fill className="object-cover" sizes="64px" unoptimized={shouldUseUnoptimizedImage(t.image)} />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v14.25a1.5 1.5 0 001.5 1.5z" /></svg>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-brand-navy text-sm truncate">{t.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{t.destination}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                        <span>USD {Number(t.base_price).toLocaleString()}</span>
                        <span>{t.duration_days}d</span>
                        <span>{t.category || "—"}</span>
                        <span className="flex items-center gap-0.5 font-semibold text-blue-600">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                          {t.booking_count ?? 0} booked
                        </span>
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${t.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {t.is_active ? "Active" : "Inactive"}
                        </span>
                        {t.is_latest && (
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700">
                            Latest
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                    <EditButton onClick={() => openEdit(t)} className="flex-1 justify-center" />
                    <DeleteButton onClick={() => handleDelete(t.slug)} className="flex-1 justify-center" />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-lg font-bold text-brand-navy mb-4">
              {editing ? "Edit Tour" : "Create Tour"}
            </h3>
            {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
              <Field label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} placeholder="e.g. everest-base-camp" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                <textarea
                  required
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-navy focus:border-transparent outline-none text-sm"
                  placeholder="2-3 line summary shown on cards"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Description <span className="text-gray-400 font-normal text-xs">(supports rich text & image upload)</span>
                </label>
                <RichTextEditor
                  value={form.long_description}
                  onChange={(html) => setForm((f) => ({ ...f, long_description: html }))}
                  token={token}
                  placeholder="Detailed description for the tour detail page..."
                  minHeight="180px"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Destination" value={form.destination} onChange={(v) => setForm({ ...form, destination: v })} />
                <Field label="Base Price" value={form.base_price} onChange={(v) => setForm({ ...form, base_price: v })} type="number" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-navy focus:border-transparent outline-none text-sm"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                  <select
                    value={form.difficulty}
                    onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-navy focus:border-transparent outline-none text-sm"
                  >
                    {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Rating (0-5)" value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} type="number" required={false} />
                <Field label="Badge" value={form.badge} onChange={(v) => setForm({ ...form, badge: v })} placeholder="e.g. Best Seller, New" required={false} />
              </div>
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tour Image</label>
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
                    <span className="text-sm text-green-700 font-medium px-4 text-center">
                      ✓ {form.imageFile.name}
                    </span>
                  ) : form.currentImage ? (
                    <span className="text-xs text-gray-500 px-4 text-center">Click to replace current image</span>
                  ) : (
                    <>
                      <svg className="w-8 h-8 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                      <span className="text-xs text-gray-500">Click to upload image</span>
                    </>
                  )}
                </label>
                {/* Preview */}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Highlights <span className="text-gray-400 font-normal">(one per line)</span></label>
                <textarea
                  rows={3}
                  value={form.highlights}
                  onChange={(e) => setForm({ ...form, highlights: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-navy focus:border-transparent outline-none text-sm"
                  placeholder={"Stunning mountain views\nExperienced local guides\nAuthentic cultural experience"}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Includes <span className="text-gray-400 font-normal">(one per line)</span></label>
                <textarea
                  rows={3}
                  value={form.includes}
                  onChange={(e) => setForm({ ...form, includes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-navy focus:border-transparent outline-none text-sm"
                  placeholder={"Airport transfers\nAccommodation\nMeals (breakfast & lunch)"}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gallery Images</label>
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-brand-blue hover:bg-blue-50 transition-colors bg-gray-50">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setForm({ ...form, galleryFiles: [...form.galleryFiles, ...files] });
                      e.target.value = "";
                    }}
                  />
                  <svg className="w-6 h-6 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                  <span className="text-xs text-gray-500">Click to add gallery images</span>
                </label>
                {(form.currentGallery.length > 0 || form.galleryFiles.length > 0) && (
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {form.currentGallery.map((url, i) => (
                      <div key={`existing-${i}`} className="relative group">
                        <div className="w-full h-20 rounded-lg overflow-hidden border border-gray-200 relative">
                          <Image src={url} alt={`Gallery ${i + 1}`} fill className="object-cover" sizes="100px" unoptimized={shouldUseUnoptimizedImage(url)} />
                        </div>
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, currentGallery: form.currentGallery.filter((_, idx) => idx !== i) })}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >×</button>
                      </div>
                    ))}
                    {form.galleryFiles.map((file, i) => (
                      <div key={`new-${i}`} className="relative group">
                        <div className="w-full h-20 rounded-lg overflow-hidden border border-green-200 relative">
                          <Image src={URL.createObjectURL(file)} alt={file.name} fill className="object-cover" sizes="100px" unoptimized />
                        </div>
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, galleryFiles: form.galleryFiles.filter((_, idx) => idx !== i) })}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >×</button>
                        <span className="absolute bottom-0.5 left-0.5 bg-green-600/80 text-white text-[8px] px-1 rounded">New</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-500 font-semibold">USD</div>
                </div>
                <NumberField label="Duration (days)" value={form.duration_days} onChange={(v) => setForm({ ...form, duration_days: v })} min={1} />
                <NumberField label="Max Capacity" value={form.max_capacity} onChange={(v) => setForm({ ...form, max_capacity: v })} min={1} />
              </div>
              <div className="flex gap-3">
                <label className="flex-1 flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors select-none"
                  style={{borderColor: form.is_active ? '#22c55e' : '#e5e7eb', background: form.is_active ? '#f0fdf4' : '#f9fafb'}}>
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="w-4 h-4 accent-green-500"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Active</p>
                    <p className="text-[10px] text-gray-500">Visible to public</p>
                  </div>
                </label>
                <label className="flex-1 flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors select-none"
                  style={{borderColor: form.is_latest ? '#f59e0b' : '#e5e7eb', background: form.is_latest ? '#fffbeb' : '#f9fafb'}}>
                  <input
                    type="checkbox"
                    checked={form.is_latest}
                    onChange={(e) => setForm({ ...form, is_latest: e.target.checked })}
                    className="w-4 h-4 accent-amber-500"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Featured</p>
                    <p className="text-[10px] text-gray-500">Show on home page</p>
                  </div>
                </label>
              </div>
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
    </AdminShell>
  );
}

function Field({
  label, value, onChange, type = "text", placeholder, required = true,
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        required={required}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-navy focus:border-transparent outline-none text-sm"
      />
    </div>
  );
}

function NumberField({
  label, value, onChange, min,
}: {
  label: string; value: number; onChange: (v: number) => void; min?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        required
        type="number"
        min={min}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-navy focus:border-transparent outline-none text-sm"
      />
    </div>
  );
}
