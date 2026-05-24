"use client";

import { useState, useEffect, useCallback } from "react";
import AdminShell from "../AdminShell";
import { EditButton, DeleteButton, CancelButton } from "../components/ActionButtons";
import {
  getAboutStats, createAboutStat, updateAboutStat, deleteAboutStat,
  getValues, createValue, updateValue, deleteValue,
  getLeaders, createLeader, updateLeader, deleteLeader,
  getMilestones, createMilestone, updateMilestone, deleteMilestone,
  getSiteConfig, updateSiteConfig,
  type APIAboutStat, type APIValue, type APILeader, type APIMilestone, type SiteConfig,
} from "@/lib/api";

type Tab = "who-we-are" | "stats" | "values" | "leaders" | "milestones";

export default function AdminAboutPage() {
  return (
    <AdminShell>
      <AboutContent />
    </AdminShell>
  );
}

function AboutContent() {
  const [tab, setTab] = useState<Tab>("who-we-are");
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

  const tabs: { key: Tab; label: string }[] = [
    { key: "who-we-are", label: "Who We Are" },
    { key: "stats", label: "Stats" },
    { key: "values", label: "Values" },
    { key: "leaders", label: "Leaders" },
    { key: "milestones", label: "Milestones" },
  ];

  return (
    <div>
      <div className="flex gap-2 mb-6 border-b border-gray-200 pb-3 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              tab === t.key ? "bg-brand-navy text-white" : "text-gray-500 hover:text-brand-navy hover:bg-gray-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "who-we-are" && <WhoWeAreSection token={token} />}
      {tab === "stats" && <StatsSection token={token} />}
      {tab === "values" && <ValuesSection token={token} />}
      {tab === "leaders" && <LeadersSection token={token} />}
      {tab === "milestones" && <MilestonesSection token={token} />}
    </div>
  );
}

/* ═══════════════════ WHO WE ARE ═══════════════════ */
function WhoWeAreSection({ token }: { token: string | null }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    about_eyebrow: "",
    about_title: "",
    about_paragraph_1: "",
    about_paragraph_2: "",
  });

  useEffect(() => {
    getSiteConfig()
      .then((cfg: SiteConfig) => {
        setForm({
          about_eyebrow: cfg.about_eyebrow || "",
          about_title: cfg.about_title || "",
          about_paragraph_1: cfg.about_paragraph_1 || "",
          about_paragraph_2: cfg.about_paragraph_2 || "",
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("about_eyebrow", form.about_eyebrow);
      fd.append("about_title", form.about_title);
      fd.append("about_paragraph_1", form.about_paragraph_1);
      fd.append("about_paragraph_2", form.about_paragraph_2);
      await updateSiteConfig(fd, token);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-gray-400 text-center py-8">Loading...</p>;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5 max-w-2xl">
      <h3 className="text-lg font-bold text-brand-navy">Who We Are — Section Text</h3>
      <p className="text-xs text-gray-500 -mt-2">
        Controls the heading, subheading, and paragraphs in the &ldquo;Who We Are&rdquo; section on the About page. The stats below it are managed in the <strong>Stats</strong> tab.
      </p>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Eyebrow label <span className="text-gray-400 font-normal">(small uppercase text above heading)</span></label>
        <input
          value={form.about_eyebrow}
          onChange={(e) => setForm({ ...form, about_eyebrow: e.target.value })}
          placeholder="Who We Are"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-navy focus:border-transparent outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Heading</label>
        <input
          value={form.about_title}
          onChange={(e) => setForm({ ...form, about_title: e.target.value })}
          placeholder="We Make Every Trek Meaningful"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-navy focus:border-transparent outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">First Paragraph</label>
        <textarea
          rows={5}
          value={form.about_paragraph_1}
          onChange={(e) => setForm({ ...form, about_paragraph_1: e.target.value })}
          placeholder="Founded in the heart of Kathmandu..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-navy focus:border-transparent outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Second Paragraph <span className="text-gray-400 font-normal">(optional)</span></label>
        <textarea
          rows={4}
          value={form.about_paragraph_2}
          onChange={(e) => setForm({ ...form, about_paragraph_2: e.target.value })}
          placeholder="From the icefields of the Himalayas..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-navy focus:border-transparent outline-none"
        />
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-brand-navy text-white text-sm font-semibold rounded-lg hover:bg-brand-blue transition-colors disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        {saved && <span className="text-green-600 text-sm font-medium">Saved!</span>}
      </div>
    </div>
  );
}

/* ═══════════════════ STATS ═══════════════════ */
function StatsSection({ token }: { token: string | null }) {
  const [items, setItems] = useState<APIAboutStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<APIAboutStat | null>(null);
  const [form, setForm] = useState({ label: "", value: "", order: 0 });

  const load = useCallback(() => {
    setLoading(true);
    getAboutStats().then(setItems).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!token) return;
    if (editing) {
      await updateAboutStat(editing.id, form, token);
    } else {
      await createAboutStat(form, token);
    }
    setEditing(null);
    setForm({ label: "", value: "", order: 0 });
    load();
  };

  const handleDelete = async (id: number) => {
    if (!token || !confirm("Delete this stat?")) return;
    await deleteAboutStat(id, token);
    load();
  };

  return (
    <div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-bold text-brand-navy mb-4">{editing ? "Edit Stat" : "Add Stat"}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input placeholder="Label (e.g. Happy Trekkers)" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className="px-3 py-2 border rounded-lg text-sm" />
          <input placeholder="Value (e.g. 10K+)" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="px-3 py-2 border rounded-lg text-sm" />
          <input type="number" placeholder="Order" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} className="px-3 py-2 border rounded-lg text-sm" />
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={handleSave} className="px-5 py-2 bg-brand-navy text-white text-sm font-semibold rounded-lg hover:bg-brand-blue transition-colors">{editing ? "Update" : "Add"}</button>
          {editing && <CancelButton onClick={() => { setEditing(null); setForm({ label: "", value: "", order: 0 }); }} />}
        </div>
      </div>
      {loading ? (
        <p className="text-gray-400 text-center py-8">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No stats yet. Add one above.</p>
      ) : (
        <div className="grid gap-3">
          {items.sort((a, b) => a.order - b.order).map((s) => (
            <div key={s.id} className="bg-white rounded-lg border p-4 flex items-center justify-between">
              <div><span className="font-bold text-brand-navy mr-2">{s.value}</span><span className="text-gray-500 text-sm">{s.label}</span></div>
              <div className="flex gap-2 flex-shrink-0">
                <EditButton onClick={() => { setEditing(s); setForm({ label: s.label, value: s.value, order: s.order }); }} />
                <DeleteButton onClick={() => handleDelete(s.id)} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════ VALUES ═══════════════════ */
function ValuesSection({ token }: { token: string | null }) {
  const [items, setItems] = useState<APIValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<APIValue | null>(null);
  const [form, setForm] = useState({ title: "", description: "", icon_svg_path: "", order: 0 });

  const load = useCallback(() => {
    setLoading(true);
    getValues().then(setItems).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!token) return;
    if (editing) {
      await updateValue(editing.id, form, token);
    } else {
      await createValue(form, token);
    }
    setEditing(null);
    setForm({ title: "", description: "", icon_svg_path: "", order: 0 });
    load();
  };

  const handleDelete = async (id: number) => {
    if (!token || !confirm("Delete this value?")) return;
    await deleteValue(id, token);
    load();
  };

  return (
    <div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-bold text-brand-navy mb-4">{editing ? "Edit Value" : "Add Value"}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="px-3 py-2 border rounded-lg text-sm" />
          <input type="number" placeholder="Order" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} className="px-3 py-2 border rounded-lg text-sm" />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="px-3 py-2 border rounded-lg text-sm sm:col-span-2" rows={3} />
          <input placeholder="SVG Icon Path (optional)" value={form.icon_svg_path || ""} onChange={(e) => setForm({ ...form, icon_svg_path: e.target.value })} className="px-3 py-2 border rounded-lg text-sm sm:col-span-2" />
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={handleSave} className="px-5 py-2 bg-brand-navy text-white text-sm font-semibold rounded-lg hover:bg-brand-blue transition-colors">{editing ? "Update" : "Add"}</button>
          {editing && <CancelButton onClick={() => { setEditing(null); setForm({ title: "", description: "", icon_svg_path: "", order: 0 }); }} />}
        </div>
      </div>
      {loading ? (
        <p className="text-gray-400 text-center py-8">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No values yet. Add one above.</p>
      ) : (
        <div className="grid gap-3">
          {items.sort((a, b) => a.order - b.order).map((v) => (
            <div key={v.id} className="bg-white rounded-lg border p-4 flex items-center justify-between">
              <div><span className="font-bold text-brand-navy mr-2">{v.title}</span><span className="text-gray-500 text-sm line-clamp-1">{v.description}</span></div>
              <div className="flex gap-2 flex-shrink-0">
                <EditButton onClick={() => { setEditing(v); setForm({ title: v.title, description: v.description, icon_svg_path: v.icon_svg_path || "", order: v.order }); }} />
                <DeleteButton onClick={() => handleDelete(v.id)} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════ LEADERS ═══════════════════ */
function LeadersSection({ token }: { token: string | null }) {
  const [items, setItems] = useState<APILeader[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<APILeader | null>(null);
  const [form, setForm] = useState<{ name: string; role: string; bio: string; order: number; category: "guide" | "team" }>({ name: "", role: "", bio: "", order: 0, category: "guide" });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    getLeaders().then(setItems).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!token) return;
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("role", form.role);
    fd.append("bio", form.bio);
    fd.append("category", form.category);
    fd.append("order", String(form.order));
    if (imageFile) fd.append("image_file", imageFile);

    if (editing) {
      await updateLeader(editing.id, fd, token);
    } else {
      await createLeader(fd, token);
    }
    setEditing(null);
    setForm({ name: "", role: "", bio: "", order: 0, category: "guide" });
    setImageFile(null);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!token || !confirm("Delete this leader?")) return;
    await deleteLeader(id, token);
    load();
  };

  return (
    <div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-bold text-brand-navy mb-4">{editing ? "Edit Member" : "Add Member"}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="px-3 py-2 border rounded-lg text-sm" />
          <input placeholder="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="px-3 py-2 border rounded-lg text-sm" />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as "guide" | "team" })} className="px-3 py-2 border rounded-lg text-sm bg-white">
            <option value="guide">Trail Leader / Guide</option>
            <option value="team">Office Team (CEO / Staff)</option>
          </select>
          <input type="number" placeholder="Order" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} className="px-3 py-2 border rounded-lg text-sm" />
          <textarea placeholder="Bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="px-3 py-2 border rounded-lg text-sm sm:col-span-2" rows={3} />
          <div className="sm:col-span-2">
            <label className="block text-sm text-gray-600 mb-1">Photo</label>
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="text-sm" />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={handleSave} className="px-5 py-2 bg-brand-navy text-white text-sm font-semibold rounded-lg hover:bg-brand-blue transition-colors">{editing ? "Update" : "Add"}</button>
          {editing && <CancelButton onClick={() => { setEditing(null); setForm({ name: "", role: "", bio: "", order: 0, category: "guide" }); setImageFile(null); }} />}
        </div>
      </div>
      {loading ? (
        <p className="text-gray-400 text-center py-8">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No members yet. Add one above.</p>
      ) : (
        <div className="grid gap-3">
          {items.sort((a, b) => a.order - b.order).map((l) => (
            <div key={l.id} className="bg-white rounded-lg border p-4 flex items-center gap-4">
              {l.image && (
                <img src={l.image} alt={l.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <span className="font-bold text-brand-navy mr-2">{l.name}</span>
                <span className="text-gray-500 text-sm">{l.role}</span>
                <span className={`ml-2 inline-block text-[0.65rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${(l.category || "guide") === "team" ? "bg-brand-orange/10 text-brand-orange" : "bg-brand-blue/10 text-brand-blue"}`}>
                  {(l.category || "guide") === "team" ? "Office Team" : "Guide"}
                </span>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <EditButton onClick={() => { setEditing(l); setForm({ name: l.name, role: l.role, bio: l.bio, order: l.order, category: (l.category || "guide") as "guide" | "team" }); setImageFile(null); }} />
                <DeleteButton onClick={() => handleDelete(l.id)} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════ MILESTONES ═══════════════════ */
function MilestonesSection({ token }: { token: string | null }) {
  const [items, setItems] = useState<APIMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<APIMilestone | null>(null);
  const [form, setForm] = useState({ year: "", text: "", order: 0 });

  const load = useCallback(() => {
    setLoading(true);
    getMilestones().then(setItems).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!token) return;
    if (editing) {
      await updateMilestone(editing.id, form, token);
    } else {
      await createMilestone(form, token);
    }
    setEditing(null);
    setForm({ year: "", text: "", order: 0 });
    load();
  };

  const handleDelete = async (id: number) => {
    if (!token || !confirm("Delete this milestone?")) return;
    await deleteMilestone(id, token);
    load();
  };

  return (
    <div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-bold text-brand-navy mb-4">{editing ? "Edit Milestone" : "Add Milestone"}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input placeholder="Year (e.g. 2018)" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className="px-3 py-2 border rounded-lg text-sm" />
          <input placeholder="Description" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} className="px-3 py-2 border rounded-lg text-sm" />
          <input type="number" placeholder="Order" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} className="px-3 py-2 border rounded-lg text-sm" />
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={handleSave} className="px-5 py-2 bg-brand-navy text-white text-sm font-semibold rounded-lg hover:bg-brand-blue transition-colors">{editing ? "Update" : "Add"}</button>
          {editing && <CancelButton onClick={() => { setEditing(null); setForm({ year: "", text: "", order: 0 }); }} />}
        </div>
      </div>
      {loading ? (
        <p className="text-gray-400 text-center py-8">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No milestones yet. Add one above.</p>
      ) : (
        <div className="grid gap-3">
          {items.sort((a, b) => a.order - b.order).map((m) => (
            <div key={m.id} className="bg-white rounded-lg border p-4 flex items-center justify-between">
              <div><span className="font-bold text-brand-navy mr-2">{m.year}</span><span className="text-gray-500 text-sm">{m.text}</span></div>
              <div className="flex gap-2 flex-shrink-0">
                <EditButton onClick={() => { setEditing(m); setForm({ year: m.year, text: m.text, order: m.order }); }} />
                <DeleteButton onClick={() => handleDelete(m.id)} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
