import type { CheckResult } from "@/domain/check-result";
import { sampleDocuments } from "@/domain/sample-documents";
import type { AiProvider, ObjectRequest, TextRequest } from "@diepen/ai/provider";
import { presets } from "@diepen/voice/presets";
import type { DocumentCheck } from "@diepen/voice/tasks/document-check";
import { describe, expect, expectTypeOf, it, vi } from "vitest";
import { checkUploadedDocument } from "./check-uploaded-document";
import type { FileStore } from "./ports/file-store";
import type { OcrService, UploadedFile } from "./ports/ocr-service";

const profile = presets["ledgerwick-accounting"];

/** Answers like the mock provider (the request's own `mock`, checked against the schema) and keeps every request. */
function recordingProvider() {
  const requests: ObjectRequest<unknown>[] = [];
  const provider: AiProvider = {
    name: "mock",
    async *streamText(request: TextRequest) {
      yield await Promise.resolve(request.mock());
    },
    generateText: (request: TextRequest) => Promise.resolve(request.mock()),
    generateObject<T>(request: ObjectRequest<T>): Promise<T> {
      requests.push(request);
      return Promise.resolve().then(() => request.schema.parse(request.mock()));
    },
  };
  return { provider, requests };
}

function fakeOcr(answer: { ocrText?: string } = {}): OcrService {
  return { name: "claude", read: vi.fn(() => Promise.resolve(answer)) };
}

function fakeFileStore() {
  const save = vi.fn<FileStore["save"]>((entry) => Promise.resolve({ path: `${entry.folder}/${entry.fileName}` }));
  return { save };
}

const pdfBytes = new TextEncoder().encode("%PDF-1.7\n1 0 obj\n<<>>\nendobj\n%%EOF\n");
const pngBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);

function uploaded(name: string): UploadedFile {
  const png = name.endsWith(".png");
  return { name, mediaType: png ? "image/png" : "application/pdf", bytes: png ? pngBytes : pdfBytes };
}

const expectedFiling: Record<string, { folder: string; fileName: string }> = {
  "payslip-summary-2025.pdf": { folder: "02 Income", fileName: "2025_Okafor-Daniel_Payslip-summary.pdf" },
  "payslip-summary-2025-page-1-only.pdf": { folder: "00 Needs attention", fileName: "2025_Okafor-Daniel_Payslip-summary_missing-page.pdf" },
  "payslip-summary-2025-amara-okafor.pdf": { folder: "00 Needs attention", fileName: "2025_Okafor-Amara_Payslip-summary_wrong-person.pdf" },
  "bank-interest-statement-2024.pdf": { folder: "00 Needs attention", fileName: "2024_Okafor-Daniel_Bank-interest-statement_wrong-year.pdf" },
  "bank-interest-statement-2025.pdf": { folder: "03 Bank", fileName: "2025_Okafor-Daniel_Bank-interest-statement.pdf" },
  "donation-receipt-2025.pdf": { folder: "04 Deductions", fileName: "2025_Okafor-Daniel_Donation-receipt.pdf" },
  "home-office-confirmation-2025-unsigned.pdf": {
    folder: "00 Needs attention",
    fileName: "2025_Okafor-Daniel_Home-office-confirmation_missing-signature.pdf",
  },
  "home-office-confirmation-2025-signed.pdf": { folder: "04 Deductions", fileName: "2025_Okafor-Daniel_Home-office-confirmation.pdf" },
  "health-insurance-statement-2025.png": { folder: "05 Insurance", fileName: "2025_Okafor-Daniel_Health-insurance-statement.png" },
};

describe("checkUploadedDocument @documents.upload", () => {
  it.each(sampleDocuments.map((sample) => [sample.fileName, sample] as const))(
    "returns the recorded result for %s, files it once and reports the item event",
    async (fileName, sample) => {
      const { provider } = recordingProvider();
      const fileStore = fakeFileStore();
      const file = uploaded(fileName);

      const outcome = await checkUploadedDocument({ file, itemId: sample.itemId, profile }, { provider, ocr: fakeOcr(), fileStore });

      expect(outcome.check).toEqual(sample.result);
      expect(outcome.itemEvent).toBe(sample.result.status === "ok" ? "checkPassed" : "checkFailed");
      expect(outcome.filing).toEqual(expectedFiling[fileName]);
      expect(fileStore.save).toHaveBeenCalledTimes(1);
      expect(fileStore.save).toHaveBeenCalledWith(expect.objectContaining({ ...expectedFiling[fileName], file }));
    },
  );

  it("asks the analysis model for a document check with at most 1,200 output tokens", async () => {
    const { provider, requests } = recordingProvider();
    await checkUploadedDocument(
      { file: uploaded("payslip-summary-2025.pdf"), itemId: "payslip-summary", profile },
      { provider, ocr: fakeOcr(), fileStore: fakeFileStore() },
    );
    expect(requests).toHaveLength(1);
    expect(requests[0]?.role).toBe("analysis");
    expect(requests[0]?.maxTokens).toBeLessThanOrEqual(1200);
  });
});

describe("checkUploadedDocument with a file the mock does not know @documents.own-file", () => {
  it("returns the generic demo answer and checkFailed", async () => {
    const fileStore = fakeFileStore();
    const outcome = await checkUploadedDocument(
      { file: uploaded("my-file.pdf"), itemId: "payslip-summary", profile },
      { provider: recordingProvider().provider, ocr: fakeOcr(), fileStore },
    );
    expect(outcome.check).toMatchObject({ status: "problem", documentType: "Unknown document", person: null, year: null });
    expect(outcome.check.issues).toEqual([
      { kind: "other", detail: "Demo answers only cover the sample files. Pick a sample to see a full check." },
    ]);
    expect(outcome.itemEvent).toBe("checkFailed");
    expect(outcome.filing.folder).toBe("00 Needs attention");
    expect(fileStore.save).toHaveBeenCalledTimes(1);
  });
});

describe("checkUploadedDocument with OCR text @documents.upload", () => {
  it("puts the OCR text in the context and still attaches the file", async () => {
    const { provider, requests } = recordingProvider();
    const ocrText = "SAMPLE OCR LINE: Annual payslip summary 2025\nGross pay EUR 58,400.00";
    const read = vi.fn<OcrService["read"]>(() => Promise.resolve({ ocrText }));
    const ocr: OcrService = { name: "google-document-ai", read };
    const file = uploaded("payslip-summary-2025.pdf");

    await checkUploadedDocument({ file, itemId: "payslip-summary", profile }, { provider, ocr, fileStore: fakeFileStore() });

    expect(read).toHaveBeenCalledWith(file);
    const request = requests[0];
    expect(request?.system).toContain("SAMPLE OCR LINE: Annual payslip summary 2025");
    const attachments = request?.messages.at(-1)?.attachments ?? [];
    expect(attachments).toEqual([
      { name: "payslip-summary-2025.pdf", mediaType: "application/pdf", base64: Buffer.from(pdfBytes).toString("base64") },
    ]);
  });

  it("attaches the file when the OCR service returns no text", async () => {
    const { provider, requests } = recordingProvider();
    const file = uploaded("health-insurance-statement-2025.png");
    await checkUploadedDocument({ file, itemId: "health-insurance", profile }, { provider, ocr: fakeOcr(), fileStore: fakeFileStore() });
    expect(requests[0]?.messages.at(-1)?.attachments).toEqual([
      { name: "health-insurance-statement-2025.png", mediaType: "image/png", base64: Buffer.from(pngBytes).toString("base64") },
    ]);
  });
});

describe("the check result type @documents.upload", () => {
  it("equals the voice task's DocumentCheck", () => {
    expectTypeOf<CheckResult>().toEqualTypeOf<DocumentCheck>();
  });
});
