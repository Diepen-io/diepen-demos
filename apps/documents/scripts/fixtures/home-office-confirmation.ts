import { rgb } from "pdf-lib";
import { addressBlock, addSamplePage, createSamplePdf, grey, ink, line, margin, rows, savePdf, text, type Letterhead } from "./sample-page.ts";
import { employerSignature } from "./signature-paths.ts";

/**
 * The employer's form that confirms home office days. Signed and unsigned versions differ in the
 * signature and in the printed name and date under it, so text-only OCR can tell them apart too.
 */

const employer: Letterhead = {
  issuer: "Bramble Freight Ltd",
  lines: ["Human resources, 2 Depot Road, 00000 Exampletown", "A fictional company"],
  accent: rgb(0.13, 0.36, 0.3),
};

export async function homeOfficeConfirmation({ signed }: { signed: boolean }): Promise<Uint8Array> {
  const { pdf, fonts } = await createSamplePdf(`Home office confirmation 2025, ${signed ? "signed" : "unsigned"}`);
  const page = addSamplePage(pdf, fonts, employer, 1, 1);
  const y = addressBlock(page, fonts, "Daniel Okafor", ["Employee number BF-0412"]);
  text(page, fonts, "Confirmation of home office days 2025", margin, y, { size: 20, bold: true });
  text(page, fonts, "Employer statement for the employee's tax return", margin, y - 22, { color: grey });
  rows(page, fonts, [
    ["Employee", "Daniel Okafor"],
    ["Period", "1 Jan 2025 to 31 Dec 2025"],
    ["Days worked from home", "96 days"],
    ["Home office agreed in writing", "Yes"],
  ], y - 60, true);
  text(page, fonts, "We confirm that the employee worked from home on the days above at our request.", margin, y - 200);

  const signatureLine = y - 290;
  text(page, fonts, "Employer signature", margin, signatureLine + 60, { bold: true });
  if (signed) page.drawSvgPath(employerSignature, { x: margin + 4, y: signatureLine + 46, scale: 1.5, borderColor: ink, borderWidth: 1.1 });
  line(page, signatureLine, margin, margin + 240, grey);
  const name = signed ? "Priya Shah, HR" : "";
  const date = signed ? "20 Jan 2026" : "";
  text(page, fonts, `Name and role: ${name}`, margin, signatureLine - 18, { size: 9.5, color: grey });
  text(page, fonts, `Date: ${date}`, margin, signatureLine - 34, { size: 9.5, color: grey });
  return savePdf(pdf);
}
