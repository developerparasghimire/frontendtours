"use client";

import { useEffect, useState, useCallback } from "react";
import AdminShell from "../AdminShell";
import { getPageBanners, updatePageBanner, type PageBanner } from "@/lib/api";

const PAGE_OPTIONS = [
  { key: "home", label: "Home" },
  { key: "tours", label: "Tours" },
  { key: "events", label: "Events" },
  { key: "blog", label: "Blog" },
  { key: "about", label: "About" },
  { key: "contact", label: "Contact" },
  { key: "faqs", label: "FAQs" },
  { key: "booking", label: "Booking" },
  { key: "booking-policy", label: "Booking Policy" },
  { key: "privacy", label: "Privacy Policy" },
  { key: "terms", label: "Terms of Service" },
  { key: "search", label: "Search" },
];

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Record<string, PageBanner>>({});
  const [activePage, setActivePage] = useState(PAGE_OPTIONS[0].key);
  const [form, setForm] = useState({ title: "", subtitle: "", description: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const token =
    typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

  const loadBanners = useCallback(() => {
    setLoading(true);
    getPageBanners()
      .then((list) => {
        const map: Record<string, PageBanner> = {};
        for (const b of list) map[b.page] = b;
        setBanners(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadBanners();
  }, [loadBanners]);

  useEffect(() => {
    const b = banners[activePage];
    setForm({
      title: b?.title ?? "",
      subtitle: b?.subtitle ?? "",
      description: b?.description ?? "",
    });
  }, [activePage, banners]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const updated = await updatePageBanner(activePage, form, token);
      setBanners((prev) => ({ ...prev, [activePage]: updated }));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save banner. Please try again."
      );
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
      <div className="space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-brand-navy">Page Banners</h2>
          <p className="text-sm text-gray-500 mt-1">
            Customize the hero banner title, subtitle, and description for each page.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar — page list */}
          <div className="space-y-1">
            {PAGE_OPTIONS.map((p) => {
              const hasBanner = Boolean(banners[p.key]?.title);
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setActivePage(p.key)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-between transition-colors ${
                    activePage === p.key
                      ? "bg-brand-navy text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span>{p.label}</span>
                  {hasBanner && (
                    <span
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        activePage === p.key ? "bg-brand-orange" : "bg-green-400"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Edit form */}
          <div className="lg:col-span-3">
            <form
              onSubmit={handleSave}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5"
            >
              <h3 className="text-base font-bold text-brand-navy">
                {PAGE_OPTIONS.find((p) => p.key === activePage)?.label} Banner
              </h3>

              {saved && (
                <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-medium">
                  ✅ Banner saved successfully!
                </div>
              )}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy/20 text-sm text-brand-navy"
                  placeholder="e.g. Frequently Asked Questions"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Subtitle{" "}
                  <span className="normal-case font-normal">(small label above title)</span>
                </label>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy/20 text-sm text-brand-navy"
                  placeholder="e.g. Help Center"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy/20 text-sm text-brand-navy resize-none"
                  placeholder="Short descriptive text shown below the title in the hero banner."
                />
              </div>

              <p className="text-xs text-gray-400">
                Leave fields empty to use the default text built into the page.
              </p>

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-brand-navy text-white text-sm font-semibold rounded-xl hover:bg-brand-navy/90 disabled:opacity-50 transition-colors"
              >
                {saving ? "Saving…" : "Save Banner"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
