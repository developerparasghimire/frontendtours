/**
 * Serializes data to a JSON-LD string safe for injection into a <script> tag.
 * JSON.stringify does not escape </script>, which would allow an attacker-
 * controlled string to break out of the script block (XSS).
 * This is a pure function with no DOM dependency — safe to import in server components.
 */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/<\/script>/gi, "<\\/script>");
}
