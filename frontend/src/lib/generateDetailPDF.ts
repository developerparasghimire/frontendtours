import type { Tour, Event } from "@/types";

const NAVY   = [22,  43,  57]  as [number, number, number];
const ORANGE = [230, 100, 20]  as [number, number, number];
const GRAY   = [80,  80,  80]  as [number, number, number];
const LGRAY  = [160, 160, 160] as [number, number, number];
const WHITE  = [255, 255, 255] as [number, number, number];
const GREEN  = [34,  139, 34]  as [number, number, number];
const BGBOX  = [247, 249, 252] as [number, number, number];

const MARGIN  = 16;
const LINE_H  = 5.8;
const FOOTER_H = 26;

// ─── Helpers ────────────────────────────────────────────────────────────────

async function imgToBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload  = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<\/?(p|div|h[1-6]|li|br\s*\/?)(\s[^>]*)?>(\s*)/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

type Doc = import("jspdf").jsPDF;

function pageW(doc: Doc): number { return doc.internal.pageSize.getWidth(); }
function pageH(doc: Doc): number { return doc.internal.pageSize.getHeight(); }
function contentW(doc: Doc): number { return pageW(doc) - 2 * MARGIN; }

// Advance to next page if not enough room; redraws header on new pages.
function checkPage(doc: Doc, y: number, needed = 14): number {
  if (y + needed > pageH(doc) - FOOTER_H) {
    doc.addPage();
    drawHeader(doc);
    return 44;
  }
  return y;
}

// ─── Header / Footer ────────────────────────────────────────────────────────

function drawHeader(doc: Doc) {
  const W = pageW(doc);
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, W, 32, "F");
  doc.setFillColor(...ORANGE);
  doc.rect(0, 30, W, 3, "F");

  doc.setTextColor(...WHITE);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("GET TOURS NEPAL", MARGIN, 14);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("gettoursnepal.com  |  +977 976-8510607  |  info@gettoursnepal.com", MARGIN, 23);
}

// Called once at the very end — stamps footer on every page.
function stampFooters(doc: Doc) {
  const W = pageW(doc);
  const H = pageH(doc);
  const total = (doc.internal as { getNumberOfPages?: () => number }).getNumberOfPages?.() ?? 1;

  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setDrawColor(...LGRAY);
    doc.setLineWidth(0.25);
    doc.line(MARGIN, H - FOOTER_H + 4, W - MARGIN, H - FOOTER_H + 4);

    doc.setTextColor(...LGRAY);
    doc.setFont("helvetica", "normal");

    doc.setFontSize(7.5);
    doc.text(
      `Get Tours Nepal  ·  Thamel, Kathmandu, Nepal  ·  Page ${i} of ${total}`,
      MARGIN, H - FOOTER_H + 10,
    );
    doc.text(
      "gettoursnepal.com  ·  WhatsApp/Call: +977 976-8510607  ·  info@gettoursnepal.com",
      MARGIN, H - FOOTER_H + 16,
    );
    doc.text(
      "Facebook: /GetToursNepal  ·  Instagram: @gettoursnepal  ·  TikTok: @gettoursnepal",
      W - MARGIN, H - FOOTER_H + 16,
      { align: "right" },
    );
  }
}

// ─── Section title ───────────────────────────────────────────────────────────

function sectionTitle(doc: Doc, text: string, y: number): number {
  y = checkPage(doc, y, 20);
  const W = pageW(doc);

  doc.setFontSize(10.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...NAVY);
  doc.text(text.toUpperCase(), MARGIN, y);

  doc.setDrawColor(...ORANGE);
  doc.setLineWidth(0.6);
  doc.line(MARGIN, y + 2.5, W - MARGIN, y + 2.5);

  return y + 10;
}

// ─── Info grid (card style, 2-column) ────────────────────────────────────────

function infoGrid(doc: Doc, items: { label: string; value: string }[], y: number): number {
  const W   = pageW(doc);
  const CW  = contentW(doc);
  const COL = (CW - 6) / 2;

  const filled = items.filter((i) => i.value && i.value.trim());
  if (filled.length === 0) return y;

  // Pre-calculate how many rows we need
  const rows = Math.ceil(filled.length / 2);
  const cellH = 15;
  const boxH  = rows * cellH + 8;

  y = checkPage(doc, y, boxH + 6);

  // Card background
  doc.setFillColor(...BGBOX);
  doc.roundedRect(MARGIN, y, CW, boxH, 3, 3, "F");
  doc.setDrawColor(...LGRAY);
  doc.setLineWidth(0.2);
  doc.roundedRect(MARGIN, y, CW, boxH, 3, 3, "S");

  let cellY = y + 6;

  for (let i = 0; i < filled.length; i++) {
    const col  = i % 2;
    if (col === 0 && i > 0) cellY += cellH;

    const x = MARGIN + 5 + col * (COL + 6);

    // Vertical divider between columns
    if (col === 1) {
      doc.setDrawColor(...LGRAY);
      doc.setLineWidth(0.15);
      doc.line(MARGIN + COL + 3, cellY - 4, MARGIN + COL + 3, cellY + 11);
    }

    // Label
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...LGRAY);
    doc.text(filled[i].label.toUpperCase(), x, cellY);

    // Value — clip to one line using splitTextToSize so it never overflows
    const maxValW = COL - 10;
    const valText = (doc.splitTextToSize(filled[i].value, maxValW) as string[])[0];
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...NAVY);
    doc.text(valText, x, cellY + 7);
  }

  // Horizontal row separators
  for (let r = 1; r < rows; r++) {
    const lineY = y + 6 + r * cellH - 2;
    doc.setDrawColor(...LGRAY);
    doc.setLineWidth(0.1);
    doc.line(MARGIN + 4, lineY, W - MARGIN - 4, lineY);
  }

  return cellY + cellH + 2;
}

// ─── Body text (handles multi-paragraph HTML) ────────────────────────────────

function renderBodyText(doc: Doc, raw: string, y: number): number {
  const CW = contentW(doc);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GRAY);

  const paragraphs = raw.split("\n").map((p) => p.trim()).filter(Boolean);

  for (const para of paragraphs) {
    const lines = doc.splitTextToSize(para, CW) as string[];
    for (const line of lines) {
      y = checkPage(doc, y, LINE_H + 1);
      doc.text(line, MARGIN, y);
      y += LINE_H;
    }
    y += 2.5; // paragraph gap
  }
  return y + 2;
}

// ─── Bullet item (wraps long text, never overlaps) ───────────────────────────

function bulletItem(
  doc: Doc,
  text: string,
  y: number,
  opts: { green?: boolean; dot?: boolean },
): number {
  const CW       = contentW(doc);
  const indentX  = MARGIN + 8;
  const textW    = CW - 8;
  const clean    = stripHtml(text).trim();
  const lines    = doc.splitTextToSize(clean, textW) as string[];
  const needed   = lines.length * LINE_H + 3;

  y = checkPage(doc, y, needed);

  if (opts.green) {
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...GREEN);
    doc.text("✓", MARGIN + 1.5, y);
  } else {
    doc.setFillColor(...ORANGE);
    doc.circle(MARGIN + 3, y - 1.8, 1.5, "F");
  }

  doc.setFontSize(9.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GRAY);

  for (let i = 0; i < lines.length; i++) {
    if (i > 0) y = checkPage(doc, y, LINE_H + 1);
    doc.text(lines[i], indentX, y);
    if (i < lines.length - 1) y += LINE_H;
  }

  return y + LINE_H + 1;
}

// ─── CTA box ─────────────────────────────────────────────────────────────────

function drawCTA(doc: Doc, y: number, heading: string): number {
  const CW = contentW(doc);
  y = checkPage(doc, y, 30);

  doc.setFillColor(...NAVY);
  doc.roundedRect(MARGIN, y, CW, 24, 4, 4, "F");

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...WHITE);
  doc.text(heading, MARGIN + 6, y + 9);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...ORANGE);
  doc.text("gettoursnepal.com", MARGIN + 6, y + 17);

  doc.setTextColor(...WHITE);
  doc.text("  ·  +977 976-8510607  ·  info@gettoursnepal.com", MARGIN + 6 + doc.getTextWidth("gettoursnepal.com"), y + 17);

  return y + 30;
}

// ─── Tour PDF ────────────────────────────────────────────────────────────────

export async function generateTourPDF(tour: Tour): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc  = new jsPDF({ unit: "mm", format: "a4" });
  const CW   = contentW(doc);

  drawHeader(doc);
  let y = 42;

  // Hero image
  if (tour.image) {
    const b64 = await imgToBase64(tour.image);
    if (b64) {
      doc.addImage(b64, "JPEG", MARGIN, y, CW, 56, undefined, "FAST");
      y += 60;
    }
  }

  // Badge
  if (tour.badge) {
    y = checkPage(doc, y, 12);
    const badgeW = doc.getTextWidth(tour.badge) + 10;
    doc.setFillColor(...ORANGE);
    doc.roundedRect(MARGIN, y, badgeW, 7, 2, 2, "F");
    doc.setTextColor(...WHITE);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(tour.badge, MARGIN + 5, y + 5);
    y += 11;
  }

  // Title
  y = checkPage(doc, y, 16);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...NAVY);
  const titleLines = doc.splitTextToSize(tour.title, CW) as string[];
  doc.text(titleLines, MARGIN, y);
  y += titleLines.length * 9 + 6;

  // Key info grid
  y = infoGrid(doc, [
    { label: "Price",       value: tour.price      ?? "" },
    { label: "Duration",    value: tour.duration   ?? "" },
    { label: "Destination", value: tour.location   ?? "" },
    { label: "Difficulty",  value: tour.difficulty ?? "" },
    { label: "Category",    value: tour.category   ?? "" },
    { label: "Best Season", value: tour.bestSeason ?? "" },
    { label: "Rating",      value: tour.rating     ? `${tour.rating} / 5 ★` : "" },
    { label: "Max Group",   value: tour.maxGroup   ? `${tour.maxGroup} people` : "" },
  ], y);

  y += 2;

  // Description
  const descRaw = tour.longDescription ? stripHtml(tour.longDescription) : (tour.description ?? "");
  if (descRaw) {
    y = sectionTitle(doc, "About This Tour", y);
    y = renderBodyText(doc, descRaw, y);
  }

  // Highlights
  if (tour.highlights && tour.highlights.length > 0) {
    y = sectionTitle(doc, "Tour Highlights", y);
    for (const h of tour.highlights) {
      y = bulletItem(doc, h, y, {});
    }
    y += 2;
  }

  // What's Included
  if (tour.includes && tour.includes.length > 0) {
    y = sectionTitle(doc, "What's Included", y);
    for (const item of tour.includes) {
      y = bulletItem(doc, item, y, { green: true });
    }
    y += 2;
  }

  // Gallery thumbnails (up to 6, 3 per row)
  const gallery = (tour.gallery ?? []).slice(0, 6);
  if (gallery.length > 0) {
    y = sectionTitle(doc, "Gallery", y);
    const thumbW = (CW - 8) / 3;
    const thumbH = Math.round(thumbW * 0.65);
    let col = 0;
    let rowY = y;

    for (const src of gallery) {
      if (col === 0) {
        rowY = checkPage(doc, rowY, thumbH + 6);
        y    = rowY;
      }
      const b64 = await imgToBase64(src);
      if (b64) {
        doc.addImage(b64, "JPEG", MARGIN + col * (thumbW + 4), rowY, thumbW, thumbH, undefined, "FAST");
      }
      col++;
      if (col === 3) {
        col   = 0;
        rowY += thumbH + 4;
      }
    }
    y = rowY + (col > 0 ? thumbH + 4 : 0) + 4;
  }

  // CTA
  y = drawCTA(doc, y + 4, "Ready to book this tour?");

  stampFooters(doc);
  doc.save(`${tour.title.replace(/\s+/g, "_")}_GetToursNepal.pdf`);
}

// ─── Event PDF ───────────────────────────────────────────────────────────────

export async function generateEventPDF(
  event: Event & { longDescription?: string; highlights?: string[]; numericId?: number },
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const CW  = contentW(doc);

  drawHeader(doc);
  let y = 42;

  // Hero image
  if (event.image) {
    const b64 = await imgToBase64(event.image);
    if (b64) {
      doc.addImage(b64, "JPEG", MARGIN, y, CW, 56, undefined, "FAST");
      y += 60;
    }
  }

  // Category badge
  y = checkPage(doc, y, 12);
  const catLabel = event.category ?? "";
  if (catLabel) {
    const badgeW = doc.getTextWidth(catLabel) + 10;
    doc.setFillColor(...NAVY);
    doc.roundedRect(MARGIN, y, badgeW, 7, 2, 2, "F");
    doc.setTextColor(...WHITE);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(catLabel, MARGIN + 5, y + 5);
    y += 11;
  }

  // Title
  y = checkPage(doc, y, 16);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...NAVY);
  const titleLines = doc.splitTextToSize(event.title, CW) as string[];
  doc.text(titleLines, MARGIN, y);
  y += titleLines.length * 9 + 6;

  // Key info grid
  y = infoGrid(doc, [
    { label: "Date",     value: event.date              ?? "" },
    { label: "Time",     value: event.time              ?? "" },
    { label: "Venue",    value: event.location          ?? "" },
    { label: "Price",    value: event.price             ?? "" },
    { label: "Tickets",  value: event.availableTickets != null ? `${event.availableTickets} available` : "" },
    { label: "Category", value: event.category         ?? "" },
  ], y);

  y += 2;

  // Description
  const descRaw = event.longDescription
    ? stripHtml(event.longDescription)
    : (event.description ?? "");
  if (descRaw) {
    y = sectionTitle(doc, "About This Event", y);
    y = renderBodyText(doc, descRaw, y);
  }

  // Highlights
  if (event.highlights && event.highlights.length > 0) {
    y = sectionTitle(doc, "Event Highlights", y);
    for (const h of event.highlights) {
      y = bulletItem(doc, h, y, {});
    }
    y += 2;
  }

  // CTA
  y = drawCTA(doc, y + 4, "Want to attend this event?");

  stampFooters(doc);
  doc.save(`${event.title.replace(/\s+/g, "_")}_GetToursNepal.pdf`);
}
