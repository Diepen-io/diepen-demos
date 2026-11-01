import type { Attachment } from "@diepen/ai/provider";

/** One uploaded file, held in memory for a single check and never written anywhere. */
export type UploadedFile = {
  name: string;
  mediaType: Attachment["mediaType"];
  bytes: Uint8Array;
};

/**
 * Turns a file into text the check can use. The Claude adapter returns nothing, because Claude
 * reads the attached file itself; the Google Document AI adapter returns the OCR text (decision D5).
 */
export interface OcrService {
  readonly name: "claude" | "google-document-ai";
  read(file: UploadedFile): Promise<{ ocrText?: string }>;
}
