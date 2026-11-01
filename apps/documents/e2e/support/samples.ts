import { fileURLToPath } from "node:url";

/** The sample files and checklist items the flows use, as section 3 of docs/features/documents.md names them. */

export type ItemId =
  | "engagement-letter"
  | "payslip-summary"
  | "bank-interest"
  | "donation-receipt"
  | "home-office"
  | "health-insurance";

export const itemLabels: Record<ItemId, string> = {
  "engagement-letter": "Signed engagement letter",
  "payslip-summary": "Annual payslip summary 2025",
  "bank-interest": "Bank interest statement 2025",
  "donation-receipt": "Donation receipt 2025",
  "home-office": "Home office confirmation 2025",
  "health-insurance": "Health insurance statement 2025",
};

export type Sample = { fileName: string; itemId: ItemId };

export const samples = {
  payslip: { fileName: "payslip-summary-2025.pdf", itemId: "payslip-summary" },
  payslipPageOne: { fileName: "payslip-summary-2025-page-1-only.pdf", itemId: "payslip-summary" },
  payslipAmara: { fileName: "payslip-summary-2025-amara-okafor.pdf", itemId: "payslip-summary" },
  bank2024: { fileName: "bank-interest-statement-2024.pdf", itemId: "bank-interest" },
  bank2025: { fileName: "bank-interest-statement-2025.pdf", itemId: "bank-interest" },
  donation: { fileName: "donation-receipt-2025.pdf", itemId: "donation-receipt" },
  homeOfficeUnsigned: { fileName: "home-office-confirmation-2025-unsigned.pdf", itemId: "home-office" },
  homeOfficeSigned: { fileName: "home-office-confirmation-2025-signed.pdf", itemId: "home-office" },
  healthInsurance: { fileName: "health-insurance-statement-2025.png", itemId: "health-insurance" },
} as const satisfies Record<string, Sample>;

/** A committed sample file in `public/fixtures/`. */
export function fixturePath(fileName: string): string {
  return fileURLToPath(new URL(`../../public/fixtures/${fileName}`, import.meta.url));
}

/** The "Use a sample" menu label of a sample, read from the one module that holds the samples. */
export async function menuLabelFor(fileName: string): Promise<string> {
  const { sampleDocuments } = await import("@/domain/sample-documents");
  const sample = sampleDocuments.find((entry) => entry.fileName === fileName);
  if (!sample) throw new Error(`No sample named ${fileName} in domain/sample-documents.ts`);
  return sample.menuLabel;
}

/** A tiny valid-looking PDF: the server checks the first bytes, and the mock answers by file name. */
export function pdfBytes(size?: number): Buffer {
  const head = Buffer.from("%PDF-1.7\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n");
  if (size === undefined || size <= head.byteLength) return head;
  const padded = Buffer.alloc(size, 0x20);
  head.copy(padded);
  return padded;
}
