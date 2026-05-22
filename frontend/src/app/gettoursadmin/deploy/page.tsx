"use client";

import { useCallback, useEffect, useState } from "react";
import AdminShell from "../AdminShell";
import { getDeployStatus, triggerDeploy, type DeployStatus, type DeployResult } from "@/lib/api";

const TARGETS = ["vercel", "heroku", "github"] as const;
type Target = (typeof TARGETS)[number];

export default function AdminDeployPage() {
  const [status, setStatus] = useState<DeployStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Record<Target, boolean>>({ vercel: false, heroku: false, github: false });
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<DeployResult["results"] | null>(null);
  const [error, setError] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

  const load = useCallback(() => {
    if (!token) return;
    setLoading(true);
    getDeployStatus(token)
      .then((s) => {
        setStatus(s);
        setSelected({ vercel: s.vercel, heroku: s.heroku, github: false });
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load status"))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleTrigger() {
    if (!token) return;
    const chosen = TARGETS.filter((t) => selected[t] && status?.[t]);
    if (chosen.length === 0) {
      setError("Pick at least one configured target.");
      return;
    }
    if (!window.confirm(`Trigger a new deployment for: ${chosen.join(", ")}?`)) return;
    setRunning(true);
    setError("");
    setResult(null);
    try {
      const res = await triggerDeploy(token, chosen);
      setResult(res.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Deploy request failed");
    } finally {
      setRunning(false);
    }
  }

  return (
    <AdminShell>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Deploy Site</h1>
          <p className="text-sm text-gray-500 mt-1">
            Trigger a fresh deployment of the website (frontend / backend). This pings the deploy hook
            URLs you have configured on the server via environment variables &mdash; no secrets are
            stored in the database or shown here.
          </p>
        </div>

        {loading ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-sm text-gray-500">Loading status…</div>
        ) : !status ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-sm text-red-600">
            Could not load deploy status. {error}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <div className="space-y-3">
              {TARGETS.map((t) => {
                const configured = !!status[t];
                return (
                  <label key={t} className={`flex items-center justify-between gap-4 px-4 py-3 rounded-lg border ${configured ? "border-gray-200" : "border-gray-100 bg-gray-50 opacity-60"}`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        disabled={!configured}
                        checked={selected[t]}
                        onChange={(e) => setSelected((prev) => ({ ...prev, [t]: e.target.checked }))}
                        className="rounded border-gray-300 text-brand-navy focus:ring-brand-navy"
                      />
                      <div>
                        <p className="font-semibold text-brand-navy capitalize">{t}</p>
                        <p className="text-xs text-gray-500">
                          {configured
                            ? "Hook URL is configured on the server."
                            : `Not configured. Set ${t.toUpperCase()}_DEPLOY_HOOK_URL on the server to enable.`}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${configured ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-500"}`}>
                      {configured ? "Ready" : "Disabled"}
                    </span>
                  </label>
                );
              })}
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>
            )}

            <button
              type="button"
              onClick={handleTrigger}
              disabled={running}
              className="bg-brand-red text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-red/90 disabled:opacity-60"
            >
              {running ? "Triggering…" : "Trigger Deploy"}
            </button>
          </div>
        )}

        {result && (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-bold text-brand-navy mb-3">Last run</h2>
            <ul className="space-y-2 text-sm">
              {Object.entries(result).map(([name, r]) => (
                <li key={name} className="flex items-start gap-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${r.ok ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                    {r.ok ? "OK" : "Fail"}
                  </span>
                  <div>
                    <p className="font-semibold text-brand-navy capitalize">{name}</p>
                    <p className="text-xs text-gray-500">HTTP {r.status} &middot; {r.message}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 leading-relaxed">
          <strong>How this works:</strong> set <code>VERCEL_DEPLOY_HOOK_URL</code> /
          <code>HEROKU_DEPLOY_HOOK_URL</code> / <code>GITHUB_DEPLOY_HOOK_URL</code> as environment
          variables on the backend server (e.g. <code>heroku config:set VERCEL_DEPLOY_HOOK_URL=…</code>).
          Create the hooks themselves in the Vercel / Heroku / GitHub dashboards. Only superusers can
          trigger deploys. Hook URLs are never returned to the browser.
        </div>
      </div>
    </AdminShell>
  );
}
