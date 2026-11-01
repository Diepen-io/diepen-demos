import { degrees, PDFDocument, rgb, StandardFonts, type PDFFont, type PDFPage, type RGB } from "pdf-lib";

/**
 * The frame every sample PDF shares: the issuer's letterhead, a large diagonal "SAMPLE" mark, the
 * footer that says the document is fake, and page numbers. Fixed metadata keeps the bytes stable.
 */

export const pageSize: [number, number] = [595.28, 841.89];
export const margin = 56;
export const ink = rgb(0.11, 0.11, 0.12);
export const grey = rgb(0.42, 0.42, 0.45);
export const rule = rgb(0.85, 0.85, 0.87);

const fixedDate = new Date("2026-01-15T00:00:00Z");
const footerText = "Sample document for the diepen.ai demo. Fictional person and numbers.";

export type Fonts = { regular: PDFFont; bold: PDFFont };

export type Letterhead = { issuer: string; lines: readonly string[]; accent: RGB };

export async function createSamplePdf(title: string): Promise<{ pdf: PDFDocument; fonts: Fonts }> {
  const pdf = await PDFDocument.create({ updateMetadata: false });
  pdf.setTitle(`${title} (sample)`);
  pdf.setAuthor("diepen.ai demo");
  pdf.setSubject("Fictional sample document");
  pdf.setProducer("diepen-demos fixture generator");
  pdf.setCreator("diepen-demos fixture generator");
  pdf.setCreationDate(fixedDate);
  pdf.setModificationDate(fixedDate);
  const fonts = { regular: await pdf.embedFont(StandardFonts.Helvetica), bold: await pdf.embedFont(StandardFonts.HelveticaBold) };
  return { pdf, fonts };
}

export function savePdf(pdf: PDFDocument): Promise<Uint8Array> {
  return pdf.save({ useObjectStreams: false });
}

type TextOptions = { size?: number; bold?: boolean; color?: RGB };

export function text(page: PDFPage, fonts: Fonts, value: string, x: number, y: number, options: TextOptions = {}): void {
  page.drawText(value, { x, y, size: options.size ?? 10.5, font: options.bold ? fonts.bold : fonts.regular, color: options.color ?? ink });
}

export function textRight(page: PDFPage, fonts: Fonts, value: string, right: number, y: number, options: TextOptions = {}): void {
  const font = options.bold ? fonts.bold : fonts.regular;
  text(page, fonts, value, right - font.widthOfTextAtSize(value, options.size ?? 10.5), y, options);
}

export function line(page: PDFPage, y: number, from = margin, to = pageSize[0] - margin, color = rule): void {
  page.drawLine({ start: { x: from, y }, end: { x: to, y }, thickness: 0.8, color });
}

/** Label on the left, value on the right, one per line. Returns the y below the last row. */
export function rows(page: PDFPage, fonts: Fonts, entries: readonly (readonly [string, string])[], top: number, boldLast = false): number {
  let y = top;
  entries.forEach(([label, value], index) => {
    const bold = boldLast && index === entries.length - 1;
    text(page, fonts, label, margin, y, { bold });
    textRight(page, fonts, value, pageSize[0] - margin, y, { bold });
    line(page, y - 8);
    y -= 26;
  });
  return y;
}

export function addSamplePage(pdf: PDFDocument, fonts: Fonts, letterhead: Letterhead, pageNumber: number, pageCount: number): PDFPage {
  const page = pdf.addPage(pageSize);
  const [width, height] = pageSize;
  page.drawRectangle({ x: 0, y: height - 10, width, height: 10, color: letterhead.accent });
  text(page, fonts, letterhead.issuer, margin, height - 64, { size: 16, bold: true, color: letterhead.accent });
  letterhead.lines.forEach((value, index) => text(page, fonts, value, margin, height - 82 - index * 13, { size: 9, color: grey }));
  line(page, 64);
  text(page, fonts, footerText, margin, 46, { size: 8.5, color: grey });
  textRight(page, fonts, `Page ${pageNumber} of ${pageCount}`, width - margin, 46, { size: 8.5, color: grey });
  page.drawText("SAMPLE", {
    x: 150,
    y: 250,
    size: 132,
    font: fonts.bold,
    color: rgb(0.8, 0.12, 0.12),
    opacity: 0.1,
    rotate: degrees(35),
  });
  return page;
}

/** The recipient block under the letterhead. Returns the y below it. */
export function addressBlock(page: PDFPage, fonts: Fonts, name: string, lines: readonly string[], top = 700): number {
  text(page, fonts, name, margin, top, { bold: true });
  lines.forEach((value, index) => text(page, fonts, value, margin, top - 14 - index * 14));
  return top - 14 - lines.length * 14 - 30;
}
