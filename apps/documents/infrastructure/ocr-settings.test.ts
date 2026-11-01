import { describe, expect, it } from "vitest";
import { readOcrSettings } from "./ocr-settings";

const google = {
  OCR_PROVIDER: "google-document-ai",
  GOOGLE_CLOUD_PROJECT: "demo-project",
  GOOGLE_DOCUMENT_AI_LOCATION: "eu",
  GOOGLE_DOCUMENT_AI_PROCESSOR_ID: "abc123",
};

function thrown(run: () => unknown): string {
  try {
    run();
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
  throw new Error("Expected an error");
}

describe("readOcrSettings @documents.upload", () => {
  it("selects claude when OCR_PROVIDER is unset or claude", () => {
    expect(readOcrSettings({})).toEqual({ provider: "claude" });
    expect(readOcrSettings({ OCR_PROVIDER: "claude" })).toEqual({ provider: "claude" });
  });

  it("selects google-document-ai with all three Google settings", () => {
    expect(readOcrSettings(google)).toEqual({
      provider: "google-document-ai",
      project: "demo-project",
      location: "eu",
      processorId: "abc123",
    });
  });

  it("names each missing Google variable", () => {
    const message = thrown(() => readOcrSettings({ OCR_PROVIDER: "google-document-ai", GOOGLE_CLOUD_PROJECT: "demo-project" }));
    expect(message).toContain("GOOGLE_DOCUMENT_AI_LOCATION");
    expect(message).toContain("GOOGLE_DOCUMENT_AI_PROCESSOR_ID");
    expect(message).not.toContain("GOOGLE_CLOUD_PROJECT");

    const none = thrown(() => readOcrSettings({ OCR_PROVIDER: "google-document-ai" }));
    for (const name of ["GOOGLE_CLOUD_PROJECT", "GOOGLE_DOCUMENT_AI_LOCATION", "GOOGLE_DOCUMENT_AI_PROCESSOR_ID"]) {
      expect(none).toContain(name);
    }
  });

  it("names an unknown OCR_PROVIDER value", () => {
    expect(thrown(() => readOcrSettings({ OCR_PROVIDER: "textract" }))).toContain("textract");
  });
});
