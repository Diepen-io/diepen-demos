import type { UploadedFile } from "@/application/ports/ocr-service";
import { describe, expect, it, vi } from "vitest";
import { documentAiClientOptions, GoogleDocumentAiOcr, OcrError } from "./google-document-ai-ocr";

type Client = ConstructorParameters<typeof GoogleDocumentAiOcr>[0];

const settings = { project: "demo-project", location: "eu", processorId: "abc123" };
const bytes = new TextEncoder().encode("%PDF-1.7 sample");
const file: UploadedFile = { name: "payslip-summary-2025.pdf", mediaType: "application/pdf", bytes };

function fakeClient(processDocument: (request: unknown) => Promise<unknown>) {
  const spy = vi.fn(processDocument);
  return { spy, client: { processDocument: spy } as unknown as Client };
}

describe("GoogleDocumentAiOcr @documents.upload", () => {
  it("is the google-document-ai OCR service", () => {
    const { client } = fakeClient(() => Promise.resolve([{ document: { text: "" } }]));
    expect(new GoogleDocumentAiOcr(client, settings).name).toBe("google-document-ai");
  });

  it("sends the processor name, the base64 content and the MIME type, and returns the document text", async () => {
    const { spy, client } = fakeClient(() => Promise.resolve([{ document: { text: "Annual payslip summary 2025" } }]));
    const result = await new GoogleDocumentAiOcr(client, settings).read(file);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0]?.[0]).toEqual({
      name: "projects/demo-project/locations/eu/processors/abc123",
      rawDocument: { content: Buffer.from(bytes).toString("base64"), mimeType: "application/pdf" },
    });
    expect(result).toEqual({ ocrText: "Annual payslip summary 2025" });
  });

  it("creates its client on the location's API endpoint", () => {
    expect(documentAiClientOptions(settings)).toEqual({ apiEndpoint: "eu-documentai.googleapis.com" });
    expect(documentAiClientOptions({ ...settings, location: "us" })).toEqual({ apiEndpoint: "us-documentai.googleapis.com" });
  });

  it("wraps a client error in OcrError", async () => {
    const { client } = fakeClient(() => Promise.reject(new Error("PERMISSION_DENIED")));
    await expect(new GoogleDocumentAiOcr(client, settings).read(file)).rejects.toBeInstanceOf(OcrError);
  });
});
