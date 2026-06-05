"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import AdminShell from "../AdminShell";
import {
  getEventPopupAdmin,
  updateEventPopup,
  clearEventPopupImage,
  type EventPopup,
} from "@/lib/api";

export default function AdminPopupPage() {
  const [popup, setPopup] = useState<EventPopup>({
    title: "",
    image: null,
    button_text: "View Details",
    button_url: "",
    is_active: false,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("admin_token") ?? "" : "";

  useEffect(() => {
    getEventPopupAdmin(token)
      .then((data) => {
        if (data && typeof data === "object" && Object.keys(data).length > 0) {
          setPopup(data);
          if (data.image) setImagePreview(data.image);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleClearImage() {
    if (!token) return;
    try {
      await clearEventPopupImage(token);
      setPopup((p) => ({ ...p, image: null }));
      setImagePreview(null);
      setImageFile(null);
    } catch {
      setError("Failed to clear image.");
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const fd = new FormData();
      fd.append("title", popup.title);
      fd.append("button_text", popup.button_text);
      fd.append("button_url", popup.button_url);
      fd.append("is_active", popup.is_active ? "true" : "false");
      if (imageFile) fd.append("image_file", imageFile);

      const updated = await updateEventPopup(fd, token);
      setPopup(updated);
      if (updated.image) setImagePreview(updated.image);
      setImageFile(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AdminShell>
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-gray-200 border-t-brand-navy" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-brand-navy">Event Popup</h2>
          <p className="text-sm text-gray-500 mt-1">
            Configure the promotional popup that appears to visitors when they first open the website.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          {/* Active toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-brand-navy text-sm">Show popup to visitors</p>
              <p className="text-xs text-gray-400 mt-0.5">Toggle off to hide the popup sitewide.</p>
            </div>
            <button
              type="button"
              onClick={() => setPopup((p) => ({ ...p, is_active: !p.is_active }))}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                popup.is_active ? "bg-brand-navy" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                  popup.is_active ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <hr className="border-gray-100" />

          {/* Poster image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Poster Image
            </label>
            {imagePreview ? (
              <div className="relative w-full rounded-xl overflow-hidden border border-gray-200 mb-3">
                <Image
                  src={imagePreview}
                  alt="Poster preview"
                  width={600}
                  height={400}
                  className="w-full object-contain max-h-72"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={handleClearImage}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-lg transition-colors"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer hover:border-brand-navy/50 transition-colors"
              >
                <svg className="mx-auto h-10 w-10 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-gray-500">Click to upload poster image</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP recommended</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            {!imagePreview && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 text-sm text-brand-navy underline"
              >
                Choose file
              </button>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Heading <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={popup.title}
              onChange={(e) => setPopup((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Nepal Drone Festival 2026"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy/30"
            />
          </div>

          {/* Button text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Button Label
            </label>
            <input
              type="text"
              value={popup.button_text}
              onChange={(e) => setPopup((p) => ({ ...p, button_text: e.target.value }))}
              placeholder="View Details"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy/30"
            />
          </div>

          {/* Button URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Button Link
            </label>
            <input
              type="text"
              value={popup.button_url}
              onChange={(e) => setPopup((p) => ({ ...p, button_url: e.target.value }))}
              placeholder="/events/drone-festival or https://..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy/30"
            />
            <p className="text-xs text-gray-400 mt-1">Internal path (e.g. /events/my-event) or full external URL.</p>
          </div>

          {/* Error / success */}
          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2">{error}</p>
          )}
          {saved && (
            <p className="text-sm text-green-600 bg-green-50 rounded-xl px-4 py-2">Popup settings saved successfully.</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-brand-navy text-white font-semibold py-3 rounded-xl hover:bg-brand-navy/90 disabled:opacity-60 transition-colors"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </div>
    </AdminShell>
  );
}
