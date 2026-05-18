"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminShell from "../AdminShell";
import { EditButton, DeleteButton, CancelButton } from "../components/ActionButtons";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type APICategory,
} from "@/lib/api";

type Kind = "tour" | "event";

type CategoryForm = {
  kind: Kind;
  name: string;
  parent: number | null;
  order: number;
  is_active: boolean;
};

const emptyForm: CategoryForm = {
  kind: "tour",
  name: "",
  parent: null,
  order: 0,
  is_active: true,
};

const inputCls =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy transition";

export default function AdminCategoriesPage() {
  const [items, setItems] = useState<APICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeKind, setActiveKind] = useState<Kind>("tour");
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [editing, setEditing] = useState<APICategory | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

  const load = useCallback(() => {
    setLoading(true);
    getCategories()
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visibleItems = useMemo(
    () => items.filter((c) => c.kind === activeKind).sort((a, b) => {
      // Show parents first then their children, grouped.
      const pa = a.parent ?? -1;
      const pb = b.parent ?? -1;
      if (a.parent === null && b.parent !== null) return -1;
      if (a.parent !== null && b.parent === null) return 1;
      if (pa !== pb) return pa - pb;
      if (a.order !== b.order) return a.order - b.order;
      return a.name.localeCompare(b.name);
    }),
    [items, activeKind],
  );

  const parentOptions = useMemo(
    () => items.filter((c) => c.kind === activeKind && c.parent === null),
    [items, activeKind],
  );

  function resetForm(kind: Kind = activeKind) {
    setForm({ ...emptyForm, kind });
    setEditing(null);
    setError("");
  }

  function startEdit(cat: APICategory) {
    setEditing(cat);
    setForm({
      kind: cat.kind,
      name: cat.name,
      parent: cat.parent,
      order: cat.order,
      is_active: cat.is_active,
    });
    setError("");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    const trimmed = form.name.trim();
    if (!trimmed) {
      setError("Name is required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        kind: form.kind,
        name: trimmed,
        parent: form.parent,
        order: Number(form.order) || 0,
        is_active: form.is_active,
      };
      if (editing) {
        await updateCategory(editing.id, payload, token);
      } else {
        await createCategory(payload, token);
      }
      resetForm(form.kind);
      load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save category";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(cat: APICategory) {
    if (!token) return;
    const hasChildren = items.some((c) => c.parent === cat.id);
    const msg = hasChildren
      ? `Delete "${cat.name}" and all its sub-categories? This cannot be undone.`
      : `Delete "${cat.name}"? This cannot be undone.`;
    if (!window.confirm(msg)) return;
    try {
      await deleteCategory(cat.id, token);
      if (editing?.id === cat.id) resetForm();
      load();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete";
      window.alert(message);
    }
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-brand-navy">Categories</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage the tour and event categories (and Trekking sub-categories) that appear in the admin forms and on the public site.
            </p>
          </div>
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
            {(["tour", "event"] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  setActiveKind(k);
                  resetForm(k);
                }}
                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                  activeKind === k ? "bg-brand-navy text-white" : "text-gray-600 hover:text-brand-navy"
                }`}
              >
                {k === "tour" ? "Tour categories" : "Event categories"}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Name</label>
              <input
                className={inputCls}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={form.parent ? "Sub-category name (e.g. Everest Region)" : "Category name (e.g. Trekking)"}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Parent</label>
              <select
                className={inputCls}
                value={form.parent ?? ""}
                onChange={(e) => setForm({ ...form, parent: e.target.value ? Number(e.target.value) : null })}
              >
                <option value="">— Top-level category —</option>
                {parentOptions
                  .filter((p) => !editing || p.id !== editing.id)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </select>
              <p className="mt-1 text-[11px] text-gray-500">
                Choose a parent to make this a sub-category (e.g. under &quot;Trekking&quot;).
              </p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Order</label>
              <input
                type="number"
                className={inputCls}
                value={form.order}
                onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="rounded border-gray-300 text-brand-navy focus:ring-brand-navy"
              />
              Active (show in filters / dropdowns)
            </label>
            <span className="text-xs text-gray-400">Kind: <span className="font-semibold uppercase">{form.kind}</span></span>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-brand-navy text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-brand-navy/90 disabled:opacity-60"
            >
              {saving ? "Saving…" : editing ? "Update category" : "Add category"}
            </button>
            {editing && <CancelButton onClick={() => resetForm(form.kind)} />}
          </div>
        </form>

        {/* List */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              {activeKind === "tour" ? "Tour" : "Event"} categories
            </h2>
          </div>
          {loading ? (
            <div className="p-6 text-sm text-gray-500">Loading…</div>
          ) : visibleItems.length === 0 ? (
            <div className="p-6 text-sm text-gray-500">No categories yet. Add one above.</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {visibleItems.map((cat) => (
                <li key={cat.id} className="flex items-center justify-between gap-4 px-5 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {cat.parent !== null && (
                      <span className="text-gray-300 select-none">↳</span>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-brand-navy truncate">
                        {cat.name}
                        {!cat.is_active && (
                          <span className="ml-2 text-[10px] uppercase font-bold tracking-wider text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">Inactive</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        {cat.parent_name ? `under ${cat.parent_name}` : "Top-level"} · order {cat.order}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <EditButton onClick={() => startEdit(cat)} />
                    <DeleteButton onClick={() => handleDelete(cat)} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
