"use client";

import { useEffect, useState, useCallback } from "react";
import AdminShell from "../AdminShell";
import { DeleteButton } from "../components/ActionButtons";
import {
  getContactSubmissions,
  markContactRead,
  deleteContactSubmission,
  type ContactSubmission,
} from "@/lib/api";

export default function AdminContactsPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [selected, setSelected] = useState<ContactSubmission | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

  const load = useCallback(() => {
    if (!token) return;
    getContactSubmissions(token)
      .then(setSubmissions)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRead(sub: ContactSubmission) {
    if (!token) return;
    try {
      await markContactRead(sub.id, !sub.is_read, token);
      load();
      if (selected?.id === sub.id) setSelected({ ...sub, is_read: !sub.is_read });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update status.");
    }
  }

  async function handleDelete(id: number) {
    if (!token || !confirm("Delete this message?")) return;
    try {
      await deleteContactSubmission(id, token);
      if (selected?.id === id) setSelected(null);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete.");
    }
  }

  async function openMessage(sub: ContactSubmission) {
    setSelected(sub);
    if (!sub.is_read && token) {
      await markContactRead(sub.id, true, token);
      setSubmissions((prev) => prev.map((s) => s.id === sub.id ? { ...s, is_read: true } : s));
    }
  }

  const filtered = submissions.filter((s) => {
    if (filter === "unread") return !s.is_read;
    if (filter === "read") return s.is_read;
    return true;
  });

  const unreadCount = submissions.filter((s) => !s.is_read).length;

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-brand-navy">Contact Messages</h2>
            {unreadCount > 0 && (
              <span className="bg-brand-red text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {(["all", "unread", "read"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors capitalize ${
                  filter === f
                    ? "bg-brand-navy text-white border-brand-navy"
                    : "bg-white text-gray-600 border-gray-300 hover:border-brand-navy"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-gray-200 border-t-brand-navy" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            <p className="text-gray-500">No messages found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Message List */}
            <div className="lg:col-span-2 space-y-2 max-h-[70vh] overflow-y-auto pr-1">
              {filtered.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => openMessage(sub)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                    selected?.id === sub.id
                      ? "border-brand-navy bg-brand-navy/5 shadow-sm"
                      : sub.is_read
                      ? "border-gray-100 bg-white hover:border-gray-300"
                      : "border-blue-200 bg-blue-50 hover:border-blue-400"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {!sub.is_read && <span className="w-2 h-2 bg-brand-blue rounded-full flex-shrink-0" />}
                        <p className={`text-sm truncate ${sub.is_read ? "font-medium text-gray-800" : "font-bold text-brand-navy"}`}>
                          {sub.name}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{sub.subject}</p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{sub.message.slice(0, 60)}…</p>
                    </div>
                    <span className="text-[10px] text-gray-400 flex-shrink-0 mt-0.5">
                      {new Date(sub.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Message Detail */}
            <div className="lg:col-span-3">
              {selected ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-brand-navy">{selected.subject}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        From: <strong className="text-gray-700">{selected.name}</strong> &lt;{selected.email}&gt;
                        {selected.phone && <> · {selected.phone}</>}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(selected.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleRead(selected)}
                        title={selected.is_read ? "Mark as unread" : "Mark as read"}
                        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-brand-navy transition-colors"
                      >
                        <svg className="w-4 h-4" fill={selected.is_read ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                      </button>
                      <DeleteButton onClick={() => handleDelete(selected.id)} />
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">{selected.message}</p>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <a
                      href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                      className="inline-flex items-center gap-2 bg-brand-navy text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-brand-blue transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Reply via Email
                    </a>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 flex flex-col items-center justify-center text-center min-h-64">
                  <svg className="w-10 h-10 text-gray-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  <p className="text-gray-400 text-sm">Select a message to read</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
