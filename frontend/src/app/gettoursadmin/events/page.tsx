"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import AdminShell from "../AdminShell";
import { EditButton, DeleteButton, CancelButton } from "../components/ActionButtons";
import RichTextEditor from "../components/RichTextEditor";
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getCategories,
  type APIEvent,
  type APICategory,
} from "@/lib/api";
import { shouldUseUnoptimizedImage } from "@/lib/images";

type EventForm = {
  title: string;
  slug: string;
  description: string;
  long_description: string;
  category: string;
  highlights: string;
  imageFile: File | null;
  currentImage: string;
  galleryFiles: File[];
  currentGallery: string[];
  venue: string;
  event_date: string;
  base_price: string;
  currency: string;
  total_tickets: number;
  is_active: boolean;
  is_latest: boolean;
};

const EVENT_CATEGORY_FALLBACK = ["Music", "Culture", "Festivals", "Food", "Sports", "Workshops", "Adventure", "Spiritual"];

const emptyForm: EventForm = {
  title: "",
  slug: "",
  description: "",
  long_description: "",
  category: "Culture",
  highlights: "",
  imageFile: null,
  currentImage: "",
  galleryFiles: [],
  currentGallery: [],
  venue: "",
  event_date: "",
  base_price: "",
  currency: "USD",
  total_tickets: 50,
  is_active: true,
  is_latest: false,
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState<APIEvent[]>([]);
  const [categories, setCategories] = useState<APICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<APIEvent | null>(null);
  const [form, setForm] = useState<EventForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

  const loadEvents = useCallback(() => {
    getEvents()
      .then(setEvents)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const loadCategories = useCallback(() => {
    getCategories({ kind: "event", is_active: true })
      .then(setCategories)
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadEvents();
    loadCategories();
  }, [loadEvents, loadCategories]);

  const categoryOptions = useMemo(() => {
    const fromApi = categories.filter((c) => c.parent === null).map((c) => c.name);
    return Array.from(new Set([...fromApi, ...EVENT_CATEGORY_FALLBACK]));
  }, [categories]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setShowModal(true);
  }

  function openEdit(evt: APIEvent) {
    setEditing(evt);
    setForm({
      title: evt.title,
      slug: evt.slug,
      description: evt.description,
      long_description: evt.long_description || "",
      category: evt.category || "Culture",
      highlights: evt.highlights?.length ? evt.highlights.join("\n") : "",
      imageFile: null,
      currentImage: evt.image || "",
      galleryFiles: [],
      currentGallery: evt.gallery || [],
      venue: evt.venue,
      event_date: evt.event_date.slice(0, 16),
      base_price: evt.base_price,
      currency: evt.currency,
      total_tickets: evt.total_tickets,
      is_active: evt.is_active,
      is_latest: evt.is_latest,
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
      fd.append("category", form.category);
      fd.append("venue", form.venue);
      fd.append("event_date", new Date(form.event_date).toISOString());
      fd.append("base_price", form.base_price);
      fd.append("currency", form.currency);
      fd.append("total_tickets", String(form.total_tickets));
      fd.append("is_active", String(form.is_active));
      fd.append("is_latest", String(form.is_latest));
      if (form.imageFile) fd.append("image_file", form.imageFile);

      const highlights = form.highlights.split("\n").map(s => s.trim()).filter(Boolean);
      fd.append("highlights", JSON.stringify(highlights));
      fd.append("gallery", JSON.stringify(form.currentGallery));
      for (const file of form.galleryFiles) {
        fd.append("gallery_files", file);
      }

      if (editing) {
        await updateEvent(editing.slug, fd, token);
      } else {
        await createEvent(fd, token);
      }
      setShowModal(false);
      loadEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save event. Check all fields and try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(slug: string) {
    if (!token || !confirm("Are you sure you want to delete this event?")) return;
    try {
      await deleteEvent(slug, token);
      loadEvents();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete event.");
    }
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-brand-navy">Events Management</h2>
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-brand-navy text-white text-sm font-semibold rounded-lg hover:bg-brand-blue transition-colors"
          >
            + Add Event
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-navy" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <p className="text-gray-500">No events found. Create one!</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 text-left">Event</th>
                    <th className="px-4 py-3 text-left">Venue</th>
                    <th className="px-4 py-3 text-left">Category</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-right">Price</th>
                    <th className="px-4 py-3 text-center">Tickets</th>
                    <th className="px-4 py-3 text-center">Bookings</th>
                    <th className="px-4 py-3 text-center">Active</th>
                    <th className="px-4 py-3 text-center">Latest</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {events.map((evt) => (
                    <tr key={evt.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {evt.image ? (
                            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 relative">
                              <Image src={evt.image} alt={evt.title} fill className="object-cover" sizes="40px" unoptimized={shouldUseUnoptimizedImage(evt.image)} />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v14.25a1.5 1.5 0 001.5 1.5z" /></svg>
                            </div>
                          )}
                          <span className="font-medium text-brand-navy">{evt.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{evt.venue}</td>
                      <td className="px-4 py-3 text-gray-600">{evt.category || "—"}</td>
                      <td className="px-4 py-3 text-gray-600">{new Date(evt.event_date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right">USD {Number(evt.base_price).toLocaleString()}</td>
                      <td className="px-4 py-3 text-center">{evt.available_tickets}/{evt.total_tickets}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          (evt.booking_count ?? 0) > 0 ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-500"
                        }`}>
                          {evt.booking_count ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${evt.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {evt.is_active ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${evt.is_latest ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-400"}`}>
                          {evt.is_latest ? "✓" : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <EditButton onClick={() => openEdit(evt)} />
                          <DeleteButton onClick={() => handleDelete(evt.slug)} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {events.map((evt) => (
                <div key={evt.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    {evt.image ? (
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 relative">
                        <Image src={evt.image} alt={evt.title} fill className="object-cover" sizes="64px" unoptimized={shouldUseUnoptimizedImage(evt.image)} />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v14.25a1.5 1.5 0 001.5 1.5z" /></svg>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-brand-navy text-sm truncate">{evt.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{evt.venue} &middot; {new Date(evt.event_date).toLocaleDateString()}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                        <span>USD {Number(evt.base_price).toLocaleString()}</span>
                        <span>{evt.available_tickets}/{evt.total_tickets} left</span>
                        <span className="flex items-center gap-0.5 font-semibold text-purple-600">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                          {evt.booking_count ?? 0} booked
                        </span>
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${evt.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {evt.is_active ? "Active" : "Inactive"}
                        </span>
                        {evt.is_latest && (
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700">
                            Latest
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                    <EditButton onClick={() => openEdit(evt)} className="flex-1 justify-center" />
                    <DeleteButton onClick={() => handleDelete(evt.slug)} className="flex-1 justify-center" />
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
              {editing ? "Edit Event" : "Create Event"}
            </h3>
            {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
              <Field label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} placeholder="e.g. dashain-festival" />
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
                  placeholder="Detailed description for the event detail page..."
                  minHeight="180px"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                  <a href="/gettoursadmin/categories" className="ml-2 text-[11px] font-normal text-brand-blue hover:underline" target="_blank" rel="noreferrer">manage</a>
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-navy focus:border-transparent outline-none text-sm"
                >
                  {!categoryOptions.includes(form.category) && form.category && (
                    <option value={form.category}>{form.category}</option>
                  )}
                  {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Image</label>
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
                  placeholder={"Live performances\nTraditional food stalls\nCultural exhibitions"}
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Date</label>
                  <input
                    required
                    type="datetime-local"
                    value={form.event_date}
                    onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-navy focus:border-transparent outline-none text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Field label="Base Price" value={form.base_price} onChange={(v) => setForm({ ...form, base_price: v })} type="number" />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-500 font-semibold">USD</div>
                </div>
                <NumberField label="Total Tickets" value={form.total_tickets} onChange={(v) => setForm({ ...form, total_tickets: v })} min={1} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  form.is_active ? "border-green-400 bg-green-50" : "border-gray-200 bg-gray-50"
                }`}>
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="hidden"
                  />
                  <span className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${
                    form.is_active ? "bg-green-500" : "bg-gray-300"
                  }`}>
                    {form.is_active && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  </span>
                  <span className="text-sm font-medium">
                    <span className="block font-semibold text-gray-800">Active</span>
                    <span className="text-xs text-gray-500">Visible to public</span>
                  </span>
                </label>
                <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  form.is_latest ? "border-amber-400 bg-amber-50" : "border-gray-200 bg-gray-50"
                }`}>
                  <input
                    type="checkbox"
                    checked={form.is_latest}
                    onChange={(e) => setForm({ ...form, is_latest: e.target.checked })}
                    className="hidden"
                  />
                  <span className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${
                    form.is_latest ? "bg-amber-500" : "bg-gray-300"
                  }`}>
                    {form.is_latest && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  </span>
                  <span className="text-sm font-medium">
                    <span className="block font-semibold text-gray-800">Featured</span>
                    <span className="text-xs text-gray-500">Show on home page</span>
                  </span>
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
