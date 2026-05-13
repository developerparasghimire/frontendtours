"use client";

import { useState, useEffect } from "react";
import AdminShell from "../AdminShell";
import { getNewsletterSubscribers, type NewsletterSubscriber } from "@/lib/api";

export default function AdminNewsletterPage() {
  return (
    <AdminShell>
      <NewsletterContent />
    </AdminShell>
  );
}

function NewsletterContent() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

  useEffect(() => {
    if (!token) return;
    getNewsletterSubscribers(token)
      .then(setSubscribers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-brand-navy">Newsletter Subscribers</h2>
        <span className="text-sm text-gray-500">{subscribers.length} subscriber{subscribers.length !== 1 ? "s" : ""}</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-brand-navy" />
        </div>
      ) : subscribers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <p className="text-gray-400 text-4xl mb-2">📧</p>
          <p className="text-gray-500">No subscribers yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-6 py-3 font-medium text-gray-500">#</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Email</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Subscribed At</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s, i) => (
                <tr key={s.email} className="border-b last:border-b-0 hover:bg-gray-50">
                  <td className="px-6 py-3 text-gray-400">{i + 1}</td>
                  <td className="px-6 py-3 font-medium text-brand-navy">{s.email}</td>
                  <td className="px-6 py-3 text-gray-500">
                    {new Date(s.subscribed_at).toLocaleDateString("en-US", {
                      year: "numeric", month: "short", day: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
