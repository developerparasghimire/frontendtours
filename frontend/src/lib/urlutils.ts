/**
 * Pure URL safety helpers — no DOM dependency, safe to import in server components.
 * DOMPurify-dependent helpers (sanitizeHTML) stay in sanitize.ts (client-only).
 */

export function isSafeRedirect(value: string | null | undefined): boolean {
  if (!value || typeof value !== "string") return false;
  if (value.length > 512) return false;
  if (!value.startsWith("/")) return false;
  if (value.startsWith("//") || value.startsWith("/\\")) return false;
  // eslint-disable-next-line no-control-regex
  if (/[\x00-\x1f\x7f]/.test(value)) return false;
  return true;
}

export function safeRedirectOr(value: string | null | undefined, fallback = "/"): string {
  return isSafeRedirect(value) ? (value as string) : fallback;
}

export function isSafeExternalUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") return false;
  try {
    const { protocol } = new URL(url);
    return protocol === "https:" || protocol === "http:";
  } catch {
    return false;
  }
}
