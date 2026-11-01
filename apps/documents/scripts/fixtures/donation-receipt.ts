import { rgb } from "pdf-lib";
import { addressBlock, addSamplePage, createSamplePdf, grey, ink, line, margin, rows, savePdf, text, type Letterhead } from "./sample-page.ts";
import { treasurerSignature } from "./signature-paths.ts";

/** A signed receipt for one donation to a fictional charity. */

const charity: Letterhead = {
  issuer: "Elm Street Food Bank",
  lines: ["40 Elm Street, 00000 Exampletown", "A fictional registered charity"],
  accent: rgb(0.55, 0.27, 0.07),
};

export async function donationReceipt(): Promise<Uint8Array> {
  const { pdf, fonts } = await createSamplePdf("Donation receipt 2025, Daniel Okafor");
  const page = addSamplePage(pdf, fonts, charity, 1, 1);
  const y = addressBlock(page, fonts, "Daniel Okafor", ["14 Sample Street", "00000 Exampletown"]);
  text(page, fonts, "Donation receipt", margin, y, { size: 20, bold: true });
  text(page, fonts, "Confirmation of a donation for tax purposes", margin, y - 22, { color: grey });
  rows(page, fonts, [
    ["Donor", "Daniel Okafor"],
    ["Date of donation", "14 Dec 2025"],
    ["Purpose", "Food parcels for families, winter 2025"],
    ["Donation", "EUR 250.00"],
  ], y - 60, true);
  text(page, fonts, "We confirm that the amount was received and is used for the purpose above.", margin, y - 200);
  page.drawSvgPath(treasurerSignature, { x: margin + 4, y: y - 236, scale: 1.5, borderColor: ink, borderWidth: 1.1 });
  line(page, y - 284, margin, margin + 200, grey);
  text(page, fonts, "Marta Ruiz, Treasurer, 15 Dec 2025", margin, y - 298, { size: 9.5, color: grey });
  return savePdf(pdf);
}
