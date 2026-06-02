import type { Tour, Event } from "@/types";

const NAVY  = [22,  43,  57]  as [number, number, number];
const ORANGE= [230, 100, 20]  as [number, number, number];
const GRAY  = [90,  90,  90]  as [number, number, number];
const LGRAY = [160, 160, 160] as [number, number, number];
const WHITE = [255, 255, 255] as [number, number, number];
const GREEN = [34,  139, 34]  as [number, number, number];

const MARGIN = 18;

async function imgToBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function checkPage(doc: import("jspdf").jsPDF, y: number, needed = 14): number {
  if (y + needed > doc.internal.pageSize.getHeight() - 20) {
    doc.addPage();
    return 20;
  }
  return y;
}

function drawHeader(doc: import("jspdf").jsPDF) {
  const W = doc.internal.pageSize.getWidth();
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

function drawFooter(doc: import("jspdf").jsPDF) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  doc.setDrawColor(...LGRAY);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, H - 18, W - MARGIN, H - 18);
  doc.setTextColor(...LGRAY);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Get Tours Nepal  ·  gettoursnepal.com  ·  © 2025", MARGIN, H - 10);
  doc.text("This document is auto-generated from live tour data.", W - MARGIN, H - 10, { align: "right" });
}

function sectionTitle(doc: import("jspdf").jsPDF, text: string, y: number): number {
  y = checkPage(doc, y, 16);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...NAVY);
  doc.text(text, MARGIN, y);
  doc.setDrawColor(...ORANGE);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, y + 1.5, MARGIN + doc.getTextWidth(text), y + 1.5);
  return y + 8;
}

function infoGrid(
  doc: import("jspdf").jsPDF,
  items: { label: string; value: string }[],
  y: number,
): number {
  const W = doc.internal.pageSize.getWidth();
  const colW = (W - 2 * MARGIN) / 2;
  const filled = items.filter((i) => i.value);
  let col = 0;
  let rowY = y;
  for (const item of filled) {
    const x = MARGIN + (col % 2) * colW;
    if (col % 2 === 0 && col > 0) rowY += 13;
    rowY = checkPage(doc, rowY, 13);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...LGRAY);
    doc.text(item.label.toUpperCase(), x, rowY);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...NAVY);
    doc.text(item.value, x, rowY + 6);
    col++;
  }
  return rowY + 14;
}

export async function generateTourPDF(tour: Tour): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const CONTENT_W = W - 2 * MARGIN;

  drawHeader(doc);
  let y = 42;

  // Main image
  if (tour.image) {
    const b64 = await imgToBase64(tour.image);
    if (b64) {
      doc.addImage(b64, "JPEG", MARGIN, y, CONTENT_W, 58, undefined, "FAST");
      y += 62;
    }
  }

  // Badge
  if (tour.badge) {
    doc.setFillColor(...ORANGE);
    doc.roundedRect(MARGIN, y, doc.getTextWidth(tour.badge) + 8, 7, 2, 2, "F");
    doc.setTextColor(...WHITE);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(tour.badge, MARGIN + 4, y + 5);
    y += 10;
  }

  // Title
  y = checkPage(doc, y, 14);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...NAVY);
  const titleLines = doc.splitTextToSize(tour.title, CONTENT_W) as string[];
  doc.text(titleLines, MARGIN, y);
  y += titleLines.length * 9 + 4;

  // Key info grid
  y = infoGrid(doc, [
    { label: "Price",      value: tour.price ?? "" },
    { label: "Duration",   value: tour.duration ?? "" },
    { label: "Destination",value: tour.location ?? "" },
    { label: "Difficulty", value: tour.difficulty ?? "" },
    { label: "Category",   value: tour.category ?? "" },
    { label: "Best Season",value: tour.bestSeason ?? "" },
    { label: "Rating",     value: tour.rating ? `${tour.rating} / 5 ★` : "" },
    { label: "Max Group",  value: tour.maxGroup ? `${tour.maxGroup} people` : "" },
  ], y);

  // Description
  y = sectionTitle(doc, "About This Tour", y);
  const desc = tour.longDescription
    ? stripHtml(tour.longDescription)
    : tour.description;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GRAY);
  const descLines = doc.splitTextToSize(desc, CONTENT_W) as string[];
  for (const line of descLines) {
    y = checkPage(doc, y, 6);
    doc.text(line, MARGIN, y);
    y += 5.5;
  }
  y += 4;

  // Highlights
  if (tour.highlights && tour.highlights.length > 0) {
    y = sectionTitle(doc, "Tour Highlights", y);
    for (const h of tour.highlights) {
      y = checkPage(doc, y, 7);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...NAVY);
      doc.setFillColor(...ORANGE);
      doc.circle(MARGIN + 2, y - 1.5, 1.2, "F");
      doc.setTextColor(...GRAY);
      doc.text(h, MARGIN + 6, y);
      y += 6.5;
    }
    y += 3;
  }

  // Includes
  if (tour.includes && tour.includes.length > 0) {
    y = sectionTitle(doc, "What's Included", y);
    for (const item of tour.includes) {
      y = checkPage(doc, y, 7);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...GREEN);
      doc.text("✓", MARGIN + 1, y);
      doc.setTextColor(...GRAY);
      doc.text(item, MARGIN + 7, y);
      y += 6.5;
    }
    y += 3;
  }

  // Gallery thumbnails
  const gallery = (tour.gallery ?? []).slice(0, 6);
  if (gallery.length > 0) {
    y = sectionTitle(doc, "Gallery", y);
    const thumbW = (CONTENT_W - 8) / 3;
    const thumbH = thumbW * 0.65;
    let col = 0;
    let rowStartY = y;
    for (const src of gallery) {
      y = checkPage(doc, rowStartY, thumbH + 4);
      if (col === 0) rowStartY = y;
      const b64 = await imgToBase64(src);
      if (b64) {
        const x = MARGIN + col * (thumbW + 4);
        doc.addImage(b64, "JPEG", x, rowStartY, thumbW, thumbH, undefined, "FAST");
      }
      col++;
      if (col === 3) {
        col = 0;
        rowStartY += thumbH + 4;
        y = rowStartY;
      }
    }
    y = rowStartY + thumbH + 6;
  }

  // CTA box
  y = checkPage(doc, y, 24);
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(MARGIN, y, CONTENT_W, 22, 3, 3, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...NAVY);
  doc.text("Ready to book this tour?", MARGIN + 4, y + 8);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GRAY);
  doc.text("Visit gettoursnepal.com or call +977 976-8510607", MARGIN + 4, y + 15);

  drawFooter(doc);
  doc.save(`${tour.title.replace(/\s+/g, "_")}_GetToursNepal.pdf`);
}

export async function generateEventPDF(event: Event & { longDescription?: string; highlights?: string[]; numericId?: number }): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const CONTENT_W = W - 2 * MARGIN;

  drawHeader(doc);
  let y = 42;

  // Main image
  if (event.image) {
    const b64 = await imgToBase64(event.image);
    if (b64) {
      doc.addImage(b64, "JPEG", MARGIN, y, CONTENT_W, 58, undefined, "FAST");
      y += 62;
    }
  }

  // Category badge
  doc.setFillColor(...NAVY);
  doc.roundedRect(MARGIN, y, doc.getTextWidth(event.category) + 8, 7, 2, 2, "F");
  doc.setTextColor(...WHITE);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(event.category, MARGIN + 4, y + 5);
  y += 10;

  // Title
  y = checkPage(doc, y, 14);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...NAVY);
  const titleLines = doc.splitTextToSize(event.title, CONTENT_W) as string[];
  doc.text(titleLines, MARGIN, y);
  y += titleLines.length * 9 + 4;

  // Key info grid
  y = infoGrid(doc, [
    { label: "Date",     value: event.date ?? "" },
    { label: "Time",     value: event.time ?? "" },
    { label: "Venue",    value: event.location ?? "" },
    { label: "Price",    value: event.price ?? "" },
    { label: "Tickets",  value: event.availableTickets != null ? `${event.availableTickets} available` : "" },
    { label: "Category", value: event.category ?? "" },
  ], y);

  // Description
  y = sectionTitle(doc, "About This Event", y);
  const desc = event.longDescription
    ? stripHtml(event.longDescription)
    : event.description;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GRAY);
  const descLines = doc.splitTextToSize(desc, CONTENT_W) as string[];
  for (const line of descLines) {
    y = checkPage(doc, y, 6);
    doc.text(line, MARGIN, y);
    y += 5.5;
  }
  y += 4;

  // Highlights
  if (event.highlights && event.highlights.length > 0) {
    y = sectionTitle(doc, "Event Highlights", y);
    for (const h of event.highlights) {
      y = checkPage(doc, y, 7);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setFillColor(...ORANGE);
      doc.circle(MARGIN + 2, y - 1.5, 1.2, "F");
      doc.setTextColor(...GRAY);
      doc.text(h, MARGIN + 6, y);
      y += 6.5;
    }
    y += 3;
  }

  // CTA box
  y = checkPage(doc, y, 24);
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(MARGIN, y, CONTENT_W, 22, 3, 3, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...NAVY);
  doc.text("Want to attend this event?", MARGIN + 4, y + 8);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GRAY);
  doc.text("Visit gettoursnepal.com or call +977 976-8510607", MARGIN + 4, y + 15);

  drawFooter(doc);
  doc.save(`${event.title.replace(/\s+/g, "_")}_GetToursNepal.pdf`);
}
