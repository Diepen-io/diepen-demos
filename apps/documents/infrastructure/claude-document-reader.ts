import type { OcrService, UploadedFile } from "@/application/ports/ocr-service";

/**
 * The default OCR service. It reads nothing itself: the check sends the file to Claude as a PDF or
 * image attachment, and Claude reads it directly. One key, no second vendor (decision D5).
 */
export class ClaudeDocumentReader implements OcrService {
  readonly name = "claude";

  read(_file: UploadedFile): Promise<{ ocrText?: string }> {
    return Promise.resolve({});
  }
}
