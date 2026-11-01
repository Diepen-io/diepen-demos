import { mkdir, writeFile } from "node:fs/promises";
import { sampleDocuments } from "../domain/sample-documents.ts";
import { bankInterestStatement } from "./fixtures/bank-interest-statement.ts";
import { donationReceipt } from "./fixtures/donation-receipt.ts";
import { healthInsurancePhoto } from "./fixtures/health-insurance-photo.ts";
import { homeOfficeConfirmation } from "./fixtures/home-office-confirmation.ts";
import { payslipSummary, type PayslipVariant } from "./fixtures/payslip-summary.ts";

/**
 * Builds the nine sample documents of `domain/sample-documents.ts` into `public/fixtures/`.
 * The output is deterministic and committed; a unit test rebuilds it and compares the bytes.
 * Run with `pnpm --filter @diepen/documents fixtures`.
 */

const daniel: PayslipVariant = {
  person: "Daniel Okafor",
  taxId: "SAMPLE-ID 00 000 000 001",
  employeeNumber: "BF-0412",
  breakdown: [
    ["Base salary", "EUR 54,000.00"],
    ["Annual bonus", "EUR 3,200.00"],
    ["Travel allowance", "EUR 1,200.00"],
  ],
  gross: "EUR 58,400.00",
  incomeTax: "EUR 9,870.00",
  social: "EUR 11,622.00",
  net: "EUR 36,908.00",
  pagesIncluded: 2,
};

const amara: PayslipVariant = {
  person: "Amara Okafor",
  taxId: "SAMPLE-ID 00 000 000 002",
  employeeNumber: "BF-0388",
  breakdown: [
    ["Base salary", "EUR 38,400.00"],
    ["Annual bonus", "EUR 2,000.00"],
    ["Travel allowance", "EUR 800.00"],
  ],
  gross: "EUR 41,200.00",
  incomeTax: "EUR 5,610.00",
  social: "EUR 8,199.00",
  net: "EUR 27,391.00",
  pagesIncluded: 2,
};

const builders: Record<string, () => Promise<Uint8Array>> = {
  "payslip-summary-2025.pdf": () => payslipSummary(daniel),
  "payslip-summary-2025-page-1-only.pdf": () => payslipSummary({ ...daniel, pagesIncluded: 1 }),
  "payslip-summary-2025-amara-okafor.pdf": () => payslipSummary(amara),
  "bank-interest-statement-2024.pdf": () => bankInterestStatement({ year: 2024, interest: "EUR 112.40", issuedOn: "8 Jan 2025" }),
  "bank-interest-statement-2025.pdf": () => bankInterestStatement({ year: 2025, interest: "EUR 138.75", issuedOn: "7 Jan 2026" }),
  "donation-receipt-2025.pdf": () => donationReceipt(),
  "home-office-confirmation-2025-unsigned.pdf": () => homeOfficeConfirmation({ signed: false }),
  "home-office-confirmation-2025-signed.pdf": () => homeOfficeConfirmation({ signed: true }),
  "health-insurance-statement-2025.png": () => Promise.resolve(healthInsurancePhoto()),
};

export async function buildFixtures(): Promise<Map<string, Uint8Array>> {
  const files = new Map<string, Uint8Array>();
  for (const { fileName } of sampleDocuments) {
    const build = builders[fileName];
    if (!build) throw new Error(`No fixture template for ${fileName}`);
    files.set(fileName, await build());
  }
  return files;
}

async function writeFixtures(): Promise<void> {
  const folder = new URL("../public/fixtures/", import.meta.url);
  await mkdir(folder, { recursive: true });
  for (const [name, bytes] of await buildFixtures()) {
    await writeFile(new URL(name, folder), bytes);
    console.log(`${name}  ${Math.round(bytes.byteLength / 1024)} KB`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) await writeFixtures();
