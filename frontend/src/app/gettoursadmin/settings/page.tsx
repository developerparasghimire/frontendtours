"use client";

import { useEffect, useState, useCallback } from "react";
import AdminShell from "../AdminShell";
import { getSiteConfig, updateSiteConfig, type SiteConfig } from "@/lib/api";

type Section = "branding" | "homepage" | "gallery" | "about" | "contact" | "social" | "footer";

export default function AdminSettingsPage() {
  const [config, setConfig] = useState<Partial<SiteConfig>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState<Section>("branding");

  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

  const load = useCallback(() => {
    getSiteConfig()
      .then(setConfig)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function setField(key: keyof SiteConfig, value: string) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setError("");
    setSaved(false);

    const formData = new FormData();
    const textFields: (keyof SiteConfig)[] = [
      "site_name", "site_tagline", "site_description",
      "home_about_heading",
      "home_portfolio_link_label", "home_portfolio_link_url",
      "footer_text", "phone", "email", "address",
      "facebook_url", "twitter_url", "instagram_url",
      "linkedin_url", "youtube_url", "tiktok_url",
      "privacy_policy_url", "terms_of_service_url",
    ];
    for (const key of textFields) {
      if (config[key] !== undefined) {
        formData.append(key, config[key] as string);
      }
    }
    // Image uploads
    const logoInput = document.getElementById("logo_upload") as HTMLInputElement;
    const logoFile = logoInput?.files?.[0];
    if (logoFile) formData.append("logo_upload", logoFile);

    const footerLogoInput = document.getElementById("footer_logo_upload") as HTMLInputElement;
    const footerLogoFile = footerLogoInput?.files?.[0];
    if (footerLogoFile) formData.append("footer_logo_upload", footerLogoFile);

    for (let i = 1; i <= 5; i += 1) {
      const input = document.getElementById(`home_portfolio_image_${i}_upload`) as HTMLInputElement;
      const file = input?.files?.[0];
      if (file) formData.append(`home_portfolio_image_${i}_upload`, file);
    }
    for (let i = 1; i <= 12; i += 1) {
      const input = document.getElementById(`home_gallery_image_${i}_upload`) as HTMLInputElement;
      const file = input?.files?.[0];
      if (file) formData.append(`home_gallery_image_${i}_upload`, file);
    }

    try {
      const updated = await updateSiteConfig(formData, token);
      setConfig(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const sections: { key: Section; label: string; icon: string }[] = [
    { key: "branding", label: "Branding & Logo", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
    { key: "homepage", label: "Homepage Media", icon: "M5 3h14a2 2 0 012 2v14l-5-3-4 2-4-2-6 3V5a2 2 0 012-2z" },
    { key: "gallery", label: "Gallery Slider", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
    { key: "about", label: "About Page", icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { key: "contact", label: "Contact Info", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
    { key: "social", label: "Social Media", icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" },
    { key: "footer", label: "Footer", icon: "M4 6h16M4 12h16M4 18h7" },
  ];

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
        <h2 className="text-xl sm:text-2xl font-bold text-brand-navy">Site Settings</h2>

        <form onSubmit={handleSave}>
          {saved && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-medium">
              ✅ Settings saved successfully!
            </div>
          )}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar tabs */}
            <div className="space-y-1">
              {sections.map((s) => (
                <button
                  type="button"
                  key={s.key}
                  onClick={() => setActiveSection(s.key)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-left transition-colors ${
                    activeSection === s.key
                      ? "bg-brand-navy text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                  </svg>
                  {s.label}
                </button>
              ))}
            </div>

            {/* Settings panel */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              
              {activeSection === "branding" && (
                <>
                  <h3 className="text-base font-bold text-brand-navy border-b border-gray-100 pb-3">Branding &amp; Logo</h3>
                  <Field label="Site Name" value={config.site_name || ""} onChange={(v) => setField("site_name", v)} placeholder="Get Tours Nepal" />
                  <Field label="Tagline" value={config.site_tagline || ""} onChange={(v) => setField("site_tagline", v)} placeholder="Explore Nepal Like Never Before" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Site Description (SEO)</label>
                    <textarea
                      rows={3}
                      value={config.site_description || ""}
                      onChange={(e) => setField("site_description", e.target.value)}
                      placeholder="Nepal's premier travel platform..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-navy focus:border-transparent outline-none text-sm"
                    />
                  </div>
                  <ImageUploadField
                    id="logo_upload"
                    label="Site Logo"
                    currentUrl={config.logo || null}
                    helpText="Recommended: 200×60px, PNG or SVG"
                  />
                  <ImageUploadField
                    id="footer_logo_upload"
                    label="Footer Logo"
                    currentUrl={config.footer_logo || null}
                    helpText="Logo shown in the footer. Recommended: white/light variant"
                  />
                </>
              )}

              {activeSection === "homepage" && (
                <>
                  <h3 className="text-base font-bold text-brand-navy border-b border-gray-100 pb-3">Homepage Media</h3>
                  <Field
                    label="Portfolio CTA Label"
                    value={config.home_portfolio_link_label || ""}
                    onChange={(v) => setField("home_portfolio_link_label", v)}
                    placeholder="View portfolio"
                    required={false}
                  />
                  <Field
                    label="Portfolio CTA URL"
                    value={config.home_portfolio_link_url || ""}
                    onChange={(v) => setField("home_portfolio_link_url", v)}
                    placeholder="/tours"
                    required={false}
                  />
                  {[1, 2, 3, 4, 5].map((slot) => (
                    <ImageUploadField
                      key={slot}
                      id={`home_portfolio_image_${slot}_upload`}
                      label={`Portfolio Image ${slot}`}
                      currentUrl={(config[`home_portfolio_image_${slot}` as keyof SiteConfig] as string) || null}
                      helpText="Upload an image for the homepage portfolio collage"
                    />
                  ))}
                </>
              )}

              {activeSection === "gallery" && (
                <>
                  <h3 className="text-base font-bold text-brand-navy border-b border-gray-100 pb-3">Gallery Slider Images</h3>
                  <p className="text-xs text-gray-500 -mt-2">
                    These images appear in the full-width gallery slider on the home page. Upload up to 8 images. Leave slots empty to skip them.
                  </p>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((slot) => (
                    <ImageUploadField
                      key={slot}
                      id={`home_gallery_image_${slot}_upload`}
                      label={`Gallery Image ${slot}`}
                      currentUrl={(config[`home_gallery_image_${slot}` as keyof SiteConfig] as string) || null}
                      helpText="Upload a landscape image for the home page gallery slider"
                    />
                  ))}
                </>
              )}

              {activeSection === "about" && (
                <>
                  <h3 className="text-base font-bold text-brand-navy border-b border-gray-100 pb-3">
                    About Us Content
                  </h3>
                  <p className="text-xs text-gray-500">
                    The home page &ldquo;About Us&rdquo; and about page &ldquo;Who We Are&rdquo; text and stats are managed in{" "}
                    <a href="/gettoursadmin/about" className="text-brand-blue hover:underline font-semibold">About Page Content &rarr;</a>
                  </p>
                </>
              )}

              {activeSection === "contact" && (
                <>
                  <h3 className="text-base font-bold text-brand-navy border-b border-gray-100 pb-3">Contact Information</h3>
                  <Field label="Email" value={config.email || ""} onChange={(v) => setField("email", v)} type="email" placeholder="info@gettours.com.np" />
                  <Field label="Phone" value={config.phone || ""} onChange={(v) => setField("phone", v)} placeholder="+977 1-4XXXXXX" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea
                      rows={2}
                      value={config.address || ""}
                      onChange={(e) => setField("address", e.target.value)}
                      placeholder="Thamel, Kathmandu, Nepal 44600"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-navy focus:border-transparent outline-none text-sm"
                    />
                  </div>

                </>
              )}

              {activeSection === "social" && (
                <>
                  <h3 className="text-base font-bold text-brand-navy border-b border-gray-100 pb-3">Social Media Links</h3>
                  {[
                    { key: "facebook_url" as keyof SiteConfig, label: "Facebook URL", placeholder: "https://facebook.com/gettournepal" },
                    { key: "instagram_url" as keyof SiteConfig, label: "Instagram URL", placeholder: "https://instagram.com/gettournepal" },
                    { key: "twitter_url" as keyof SiteConfig, label: "Twitter / X URL", placeholder: "https://twitter.com/gettournepal" },
                    { key: "youtube_url" as keyof SiteConfig, label: "YouTube URL", placeholder: "https://youtube.com/@gettournepal" },
                    { key: "linkedin_url" as keyof SiteConfig, label: "LinkedIn URL", placeholder: "https://linkedin.com/company/gettournepal" },
                    { key: "tiktok_url" as keyof SiteConfig, label: "TikTok URL", placeholder: "https://tiktok.com/@gettournepal" },
                  ].map(({ key, label, placeholder }) => (
                    <Field
                      key={key}
                      label={label}
                      value={(config[key] as string) || ""}
                      onChange={(v) => setField(key, v)}
                      placeholder={placeholder}
                      required={false}
                    />
                  ))}
                </>
              )}

              {activeSection === "footer" && (
                <>
                  <h3 className="text-base font-bold text-brand-navy border-b border-gray-100 pb-3">Footer Content</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Footer Text / Copyright</label>
                    <textarea
                      rows={3}
                      value={config.footer_text || ""}
                      onChange={(e) => setField("footer_text", e.target.value)}
                      placeholder="© 2026 Get Tours Nepal. All rights reserved."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-navy focus:border-transparent outline-none text-sm"
                    />
                  </div>
                  <Field
                    label="Privacy Policy URL"
                    value={config.privacy_policy_url || ""}
                    onChange={(v) => setField("privacy_policy_url", v)}
                    placeholder="/privacy"
                    required={false}
                  />
                  <Field
                    label="Terms of Service URL"
                    value={config.terms_of_service_url || ""}
                    onChange={(v) => setField("terms_of_service_url", v)}
                    placeholder="/terms"
                    required={false}
                  />
                </>
              )}

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-brand-navy text-white text-sm font-semibold rounded-xl hover:bg-brand-blue transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
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

function ImageUploadField({
  id, label, currentUrl, helpText,
}: {
  id: string; label: string; currentUrl: string | null; helpText?: string;
}) {
  const [preview, setPreview] = useState<string | null>(currentUrl);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt={label} className="h-16 object-contain mb-2 rounded border border-gray-200 p-1 bg-gray-50" />
      )}
      <input
        id={id}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="block text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-navy file:text-white hover:file:bg-brand-blue transition-colors cursor-pointer"
      />
      {helpText && <p className="text-xs text-gray-400 mt-1">{helpText}</p>}
    </div>
  );
}
