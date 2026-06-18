/**
 * Pick the translated version of a field from a backend object's `translations` map.
 * Falls back to the original English field if no translation exists.
 *
 * Usage:
 *   tr(value, lang, "title")          // value.translations[lang]?.title || value.title
 *   tr(siteConfig, lang, "about_title")
 */
export function tr<T extends { translations?: Record<string, Record<string, string>> }>(
  obj: T,
  lang: string,
  field: string
): string {
  if (lang === "EN" || !obj) return (obj as Record<string, unknown>)[field] as string ?? "";
  return obj.translations?.[lang]?.[field] || ((obj as Record<string, unknown>)[field] as string) || "";
}
