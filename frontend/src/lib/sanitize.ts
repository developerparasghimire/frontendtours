/**
 * Sanitization helpers.
 *
 * sanitizeHTML uses DOMPurify (isomorphic-dompurify / jsdom) — only import
 * this file in "use client" components, never in server components or pages.
 *
 * Pure URL helpers (isSafeRedirect, safeRedirectOr, isSafeExternalUrl) live in
 * urlutils.ts and are re-exported here for backwards compatibility.
 */

import DOMPurify from "isomorphic-dompurify";
export { isSafeRedirect, safeRedirectOr, isSafeExternalUrl } from "./urlutils";

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
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|\/|#)/i,
    ADD_ATTR: ["target", "rel"],
  });
}
