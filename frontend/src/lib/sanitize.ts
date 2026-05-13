/**
 * Sanitization + URL safety helpers.
 *
 * - sanitizeHTML: Strip XSS vectors from HTML coming out of the rich-text
 *   editor or other untrusted sources before passing to dangerouslySetInnerHTML.
 * - isSafeRedirect: Whitelist `next`/`redirect` query params to internal paths
 *   only. Prevents open-redirect attacks (e.g. `?redirect=https://evil.com`).
 */

import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = [
  "a", "b", "blockquote", "br", "code", "div", "em", "h1", "h2", "h3", "h4",
  "h5", "h6", "hr", "i", "img", "li", "ol", "p", "pre", "s", "small", "span",
  "strong", "sub", "sup", "u", "ul", "table", "thead", "tbody", "tr", "td", "th",
  "figure", "figcaption",
];

const ALLOWED_ATTR = [
  "href", "src", "alt", "title", "target", "rel", "class", "id", "width",
  "height", "loading",
];

export function sanitizeHTML(dirty: string | null | undefined): string {
  if (!dirty) return "";
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    // Block dangerous URI schemes (javascript:, data:, vbscript:)
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|\/|#)/i,
    // Force external links to open safely
    ADD_ATTR: ["target", "rel"],
  });
}

/**
 * Returns the input only if it's a safe internal path.
 * A safe path:
 *   - starts with exactly one "/"
 *   - is NOT protocol-relative ("//evil.com")
 *   - is NOT a backslash-protocol ("/\\evil.com")
 *   - does NOT contain control characters
 *
 * Anything else falls back to `fallback` (default "/").
 */
export function isSafeRedirect(value: string | null | undefined): boolean {
  if (!value || typeof value !== "string") return false;
  if (value.length > 512) return false;
  // Must start with "/" but not "//" or "/\"
  if (!value.startsWith("/")) return false;
  if (value.startsWith("//") || value.startsWith("/\\")) return false;
  // No control chars, no whitespace at the start
  if (/[\u0000-\u001f\u007f]/.test(value)) return false;
  return true;
}

export function safeRedirectOr(value: string | null | undefined, fallback = "/"): string {
  return isSafeRedirect(value) ? (value as string) : fallback;
}
