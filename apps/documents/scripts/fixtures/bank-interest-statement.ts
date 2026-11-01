import { rgb } from "pdf-lib";
import { addressBlock, addSamplePage, createSamplePdf, grey, margin, rows, savePdf, text, type Letterhead } from "./sample-page.ts";

/** A one-page annual interest statement from a fictional bank. */

export type BankStatementVariant = { year: number; interest: string; issuedOn: string };

const bank: Letterhead = {
  issuer: "Sample Savings Bank",
  lines: ["1 Ledger Lane, 00000 Exampletown", "A fictional bank"],
  accent: rgb(0.16, 0.27, 0.55),
};

export async function bankInterestStatement(variant: BankStatementVariant): Promise<Uint8Array> {
  const { pdf, fonts } = await createSamplePdf(`Interest statement ${variant.year}, Daniel Okafor`);
  const page = addSamplePage(pdf, fonts, bank, 1, 1);
  const y = addressBlock(page, fonts, "Daniel Okafor", ["14 Sample Street", "00000 Exampletown"]);
  text(page, fonts, `Annual interest statement ${variant.year}`, margin, y, { size: 20, bold: true });
  text(page, fonts, `Covers 1 Jan ${variant.year} to 31 Dec ${variant.year}`, margin, y - 22, { color: grey });
  rows(page, fonts, [
    ["Account holder", "Daniel Okafor"],
    ["Account", "Instant Saver, SAMPLE-ACC 0000 0001"],
    ["Interest earned", variant.interest],
    ["Tax withheld", "EUR 0.00"],
    [`Interest credited for ${variant.year}`, variant.interest],
  ], y - 60, true);
  text(page, fonts, `Issued on ${variant.issuedOn}. Keep this statement for your tax return.`, margin, y - 230, { color: grey });
  return savePdf(pdf);
}
