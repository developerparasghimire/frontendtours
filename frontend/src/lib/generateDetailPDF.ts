import type { Tour, Event } from "@/types";

const M = 20; // left/right margin
const LINE = 6; // line height

function stripHtml(html: string): string {
  return html
    .replace(/<\/?(p|div|h[1-6]|li|br\s*\/?)(\s[^>]*)?>(\s*)/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

type Doc = import("jspdf").jsPDF;

function w(doc: Doc) { return doc.internal.pageSize.getWidth(); }
function h(doc: Doc) { return doc.internal.pageSize.getHeight(); }
function cw(doc: Doc) { return w(doc) - 2 * M; }

// Add new page if needed; returns updated y
function next(doc: Doc, y: number, need = LINE): number {
  if (y + need > h(doc) - 20) {
    doc.addPage();
    return 20;
  }
  return y;
}

// Draw a bold section heading
function heading(doc: Doc, text: string, y: number, size = 12): number {
  y = next(doc, y, size + 6);
  doc.setFontSize(size);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text(text, M, y);
  y += 2;
  // thin rule
  doc.setDrawColor(0);
  doc.setLineWidth(0.3);
  doc.line(M, y, w(doc) - M, y);
  return y + 6;
}

// Draw a label: value line
function labelValue(doc: Doc, label: string, value: string, y: number): number {
  if (!value || !value.trim()) return y;
  y = next(doc, y, LINE);
  const lw = doc.getTextWidth(label + ": ");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text(label + ": ", M, y);
  doc.setFont("helvetica", "normal");
  // wrap value to remaining width
  const lines = doc.splitTextToSize(value, cw(doc) - lw) as string[];
  doc.text(lines[0], M + lw, y);
  y += LINE;
  for (let i = 1; i < lines.length; i++) {
    y = next(doc, y, LINE);
    doc.text(lines[i], M + lw, y);
    y += LINE;
  }
  return y;
}

// Render a block of body text (handles paragraphs)
function body(doc: Doc, text: string, y: number, size = 10): number {
  doc.setFontSize(size);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0);
  const paras = text.split("\n").map(p => p.trim()).filter(Boolean);
  for (const para of paras) {
    const lines = doc.splitTextToSize(para, cw(doc)) as string[];
    for (const line of lines) {
      y = next(doc, y, LINE);
      doc.text(line, M, y);
      y += LINE;
    }
    y += 2; // paragraph gap
  }
  return y + 2;
}

// Bullet item with text wrap
function bullet(doc: Doc, text: string, y: number, prefix = "•"): number {
  const indent = M + 6;
  const textW = cw(doc) - 6;
  const clean = stripHtml(text).trim();
  const lines = doc.splitTextToSize(clean, textW) as string[];
  const need = lines.length * LINE + 2;
  y = next(doc, y, need);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0);
  doc.text(prefix, M, y);
  for (let i = 0; i < lines.length; i++) {
    if (i > 0) y = next(doc, y, LINE);
    doc.text(lines[i], indent, y);
    if (i < lines.length - 1) y += LINE;
  }
  return y + LINE + 1;
}

// Page numbers stamped at end
function pageNumbers(doc: Doc) {
  const total = (doc.internal as { getNumberOfPages?: () => number }).getNumberOfPages?.() ?? 1;
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0);
    doc.text(`Page ${i} of ${total}`, w(doc) - M, h(doc) - 10, { align: "right" });
    doc.text("Get Tours Nepal  |  gettoursnepal.com  |  +977 976-8510607", M, h(doc) - 10);
  }
}

// ─── Tour PDF ────────────────────────────────────────────────────────────────

export async function generateTourPDF(tour: Tour): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  // ── Header block ──
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0);
  doc.text("GET TOURS NEPAL  |  gettoursnepal.com  |  +977 976-8510607  |  info@gettoursnepal.com", M, 14);
  doc.setDrawColor(0);
  doc.setLineWidth(0.4);
  doc.line(M, 16, w(doc) - M, 16);

  let y = 26;

  // Title
  const titleLines = doc.splitTextToSize(tour.title, cw(doc)) as string[];
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text(titleLines, M, y);
  y += titleLines.length * 8 + 4;

  if (tour.badge) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`[ ${tour.badge} ]`, M, y);
    y += 6;
  }

  y += 2;

  // ── Details ──
  y = heading(doc, "Tour Details", y);
  y = labelValue(doc, "Price",       tour.price      ?? "", y);
  y = labelValue(doc, "Duration",    tour.duration   ?? "", y);
  y = labelValue(doc, "Destination", tour.location   ?? "", y);
  y = labelValue(doc, "Difficulty",  tour.difficulty ?? "", y);
  y = labelValue(doc, "Category",    tour.category   ?? "", y);
  y = labelValue(doc, "Best Season", tour.bestSeason ?? "", y);
  y = labelValue(doc, "Rating",      tour.rating     ? `${tour.rating} / 5` : "", y);
  y = labelValue(doc, "Max Group",   tour.maxGroup   ? `${tour.maxGroup} people` : "", y);
  y += 2;

  // ── Description ──
  const descRaw = tour.longDescription
    ? stripHtml(tour.longDescription)
    : (tour.description ?? "");
  if (descRaw) {
    y = heading(doc, "About This Tour", y);
    y = body(doc, descRaw, y);
  }

  // ── Highlights ──
  if (tour.highlights && tour.highlights.length > 0) {
    y = heading(doc, "Tour Highlights", y);
    for (const h of tour.highlights) {
      y = bullet(doc, h, y);
    }
    y += 2;
  }

  // ── What's Included ──
  if (tour.includes && tour.includes.length > 0) {
    y = heading(doc, "What's Included", y);
    for (const item of tour.includes) {
      y = bullet(doc, item, y, "✓");
    }
    y += 2;
  }

  // ── Book CTA ──
  y = next(doc, y, 16);
  y += 4;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text("To book this tour:", M, y);
  y += LINE;
  doc.setFont("helvetica", "normal");
  doc.text("Website: gettoursnepal.com", M, y); y += LINE;
  doc.text("Phone / WhatsApp: +977 976-8510607", M, y); y += LINE;
  doc.text("Email: info@gettoursnepal.com", M, y);

  pageNumbers(doc);
  doc.save(`${tour.title.replace(/\s+/g, "_")}_GetToursNepal.pdf`);
}

// ─── Event PDF ───────────────────────────────────────────────────────────────

export async function generateEventPDF(
  event: Event & { longDescription?: string; highlights?: string[]; numericId?: number },
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  // ── Header block ──
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0);
  doc.text("GET TOURS NEPAL  |  gettoursnepal.com  |  +977 976-8510607  |  info@gettoursnepal.com", M, 14);
  doc.setDrawColor(0);
  doc.setLineWidth(0.4);
  doc.line(M, 16, w(doc) - M, 16);

  let y = 26;

  // Title
  const titleLines = doc.splitTextToSize(event.title, cw(doc)) as string[];
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text(titleLines, M, y);
  y += titleLines.length * 8 + 4;

  if (event.category) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0);
    doc.text(`[ ${event.category} ]`, M, y);
    y += 6;
  }

  y += 2;

  // ── Details ──
  y = heading(doc, "Event Details", y);
  y = labelValue(doc, "Date",     event.date              ?? "", y);
  y = labelValue(doc, "Time",     event.time              ?? "", y);
  y = labelValue(doc, "Venue",    event.location          ?? "", y);
  y = labelValue(doc, "Price",    event.price             ?? "", y);
  y = labelValue(doc, "Tickets",  event.availableTickets != null ? `${event.availableTickets} available` : "", y);
  y = labelValue(doc, "Category", event.category          ?? "", y);
  y += 2;

  // ── Description ──
  const descRaw = event.longDescription
    ? stripHtml(event.longDescription)
    : (event.description ?? "");
  if (descRaw) {
    y = heading(doc, "About This Event", y);
    y = body(doc, descRaw, y);
  }

  // ── Highlights ──
  if (event.highlights && event.highlights.length > 0) {
    y = heading(doc, "Event Highlights", y);
    for (const hl of event.highlights) {
      y = bullet(doc, hl, y);
    }
    y += 2;
  }

  // ── Book CTA ──
  y = next(doc, y, 16);
  y += 4;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text("To attend this event:", M, y);
  y += LINE;
  doc.setFont("helvetica", "normal");
  doc.text("Website: gettoursnepal.com", M, y); y += LINE;
  doc.text("Phone / WhatsApp: +977 976-8510607", M, y); y += LINE;
  doc.text("Email: info@gettoursnepal.com", M, y);

  pageNumbers(doc);
  doc.save(`${event.title.replace(/\s+/g, "_")}_GetToursNepal.pdf`);
}
