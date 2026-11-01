import type { UploadedFile } from "@/application/ports/ocr-service";
import { describe, expect, it } from "vitest";
import { ClaudeDocumentReader } from "./claude-document-reader";

describe("ClaudeDocumentReader @documents.upload", () => {
  it("is the claude OCR service and returns no text, so Claude reads the attached file", async () => {
    const reader = new ClaudeDocumentReader();
    expect(reader.name).toBe("claude");

    const file: UploadedFile = {
      name: "payslip-summary-2025.pdf",
      mediaType: "application/pdf",
      get bytes(): Uint8Array {
        throw new Error("The Claude reader must not touch the bytes");
      },
    };
    await expect(reader.read(file)).resolves.toEqual({});
  });
});
