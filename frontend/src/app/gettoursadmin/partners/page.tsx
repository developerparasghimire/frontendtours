"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import AdminShell from "../AdminShell";
import { EditButton, DeleteButton, CancelButton } from "../components/ActionButtons";
import {
  getPartners,
  createPartner,
  updatePartner,
  deletePartner,
  type APIPartner,
} from "@/lib/api";
import { shouldUseUnoptimizedImage } from "@/lib/images";

type PartnerForm = {
  name: string;
  website_url: string;
  logoFile: File | null;
  currentLogo: string;
  order: number;
  is_active: boolean;
};

const emptyForm: PartnerForm = {
  name: "",
  website_url: "",
  logoFile: null,
  currentLogo: "",
  order: 0,
  is_active: true,
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
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

export default function AdminPartnersPage() {
  const [items, setItems] = useState<APIPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<APIPartner | null>(null);
  const [form, setForm] = useState<PartnerForm>(emptyForm);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

  const load = useCallback(() => {
    if (!token) return;
    getPartners()
      .then(setItems)
      .catch(() => setError("Failed to load partners."))
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

  function openEdit(partner: APIPartner) {
    setEditing(partner);
    setForm({
      name: partner.name,
      website_url: partner.website_url || "",
      logoFile: null,
      currentLogo: partner.logo || "",
      order: partner.order,
      is_active: partner.is_active,
    });
    setError("");
    setShowModal(true);
  }

  async function handleSave() {
    if (!token) return;
    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const data = new FormData();
      data.append("name", form.name);
      data.append("website_url", form.website_url);
      data.append("order", String(form.order));
      data.append("is_active", form.is_active ? "true" : "false");
      if (form.logoFile) {
        data.append("logo_file", form.logoFile);
      }

      if (editing) {
        await updatePartner(editing.id, data, token);
      } else {
        await createPartner(data, token);
      }
      setShowModal(false);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save partner.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!token || !confirm("Delete this partner?")) return;
    try {
      await deletePartner(id, token);
      load();
    } catch {
      setError("Failed to delete partner.");
    }
  }

  return (
    <AdminShell>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-brand-navy">Certificates &amp; Partners</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage partner logos and certificates shown on the home page.
            </p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-brand-navy text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-blue transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Partner
          </button>
        </div>

        {error && !showModal && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24 text-gray-400 text-sm">Loading…</div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
              <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M9 9.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">No partners added yet.</p>
            <button onClick={openCreate} className="text-sm font-semibold text-brand-navy hover:underline">
              Add your first partner
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((partner) => (
              <div
                key={partner.id}
                className={`bg-white rounded-xl border ${partner.is_active ? "border-gray-200" : "border-gray-100 opacity-60"} p-5 flex flex-col items-center gap-4 shadow-sm`}
              >
                <div className="relative h-20 w-32 flex items-center justify-center">
                  {partner.logo ? (
                    <Image
                      src={partner.logo}
                      alt={partner.name}
                      fill
                      className="object-contain"
                      sizes="128px"
                      unoptimized={shouldUseUnoptimizedImage(partner.logo)}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-400">
                      {partner.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <p className="font-semibold text-brand-navy text-sm">{partner.name}</p>
                  {partner.website_url && (
                    <a
                      href={partner.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-brand-blue hover:underline truncate max-w-[160px] inline-block"
                    >
                      {partner.website_url}
                    </a>
                  )}
                  <p className="text-xs text-gray-400 mt-1">Order: {partner.order}</p>
                  {!partner.is_active && (
                    <span className="inline-block mt-1 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                      Hidden
                    </span>
                  )}
                </div>
                <div className="flex gap-2 w-full">
                  <EditButton onClick={() => openEdit(partner)} />
                  <DeleteButton onClick={() => handleDelete(partner.id)} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-brand-navy">
                  {editing ? "Edit Partner" : "Add Partner"}
                </h2>
                <CancelButton onClick={() => setShowModal(false)} />
              </div>

              <div className="p-6 space-y-5">
                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <Field label="Name *">
                  <input
                    className={inputCls}
                    placeholder="e.g. NTB, KEEP, TAAN"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </Field>

                <Field label="Website URL">
                  <input
                    className={inputCls}
                    placeholder="https://example.com"
                    value={form.website_url}
                    onChange={(e) => setForm({ ...form, website_url: e.target.value })}
                  />
                </Field>

                <Field label="Logo">
                  <div className="space-y-3">
                    {form.currentLogo && !form.logoFile && (
                      <div className="relative h-16 w-28 rounded-lg overflow-hidden border border-gray-200 bg-slate-50">
                        <Image
                          src={form.currentLogo}
                          alt="Current logo"
                          fill
                          className="object-contain p-1"
                          unoptimized={shouldUseUnoptimizedImage(form.currentLogo)}
                        />
                      </div>
                    )}
                    {form.logoFile && (
                      <div className="relative h-16 w-28 rounded-lg overflow-hidden border border-gray-200 bg-slate-50">
                        <Image
                          src={URL.createObjectURL(form.logoFile)}
                          alt="Preview"
                          fill
                          className="object-contain p-1"
                          unoptimized
                        />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-navy file:text-white hover:file:bg-brand-blue cursor-pointer"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setForm({ ...form, logoFile: file });
                      }}
                    />
                  </div>
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Order">
                    <input
                      type="number"
                      className={inputCls}
                      value={form.order}
                      onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                    />
                  </Field>

                  <Field label="Active">
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, is_active: !form.is_active })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          form.is_active ? "bg-brand-navy" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${
                            form.is_active ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                      <span className="text-sm text-gray-600">{form.is_active ? "Visible" : "Hidden"}</span>
                    </div>
                  </Field>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2 rounded-lg bg-brand-navy text-white text-sm font-semibold hover:bg-brand-blue transition-colors disabled:opacity-60"
                >
                  {saving ? "Saving…" : editing ? "Update" : "Add Partner"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
