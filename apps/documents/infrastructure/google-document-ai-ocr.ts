import type { OcrService, UploadedFile } from "@/application/ports/ocr-service";
import type { DocumentProcessorServiceClient } from "@google-cloud/documentai";

/**
 * OCR through Google Document AI, for client builds that want Google Cloud to read the files
 * (`OCR_PROVIDER=google-document-ai`). The client comes in through the constructor, so the
 * container loads the Google library only when this adapter is chosen, and tests pass a fake.
 */

export type DocumentAiSettings = { project: string; location: string; processorId: string };

export type DocumentAiClient = Pick<DocumentProcessorServiceClient, "processDocument">;

export class OcrError extends Error {
  override readonly name = "OcrError";
}

/** A processor lives in one region and answers only on that region's endpoint. */
export function documentAiClientOptions(settings: DocumentAiSettings): { apiEndpoint: string } {
  return { apiEndpoint: `${settings.location}-documentai.googleapis.com` };
}

export class GoogleDocumentAiOcr implements OcrService {
  readonly name = "google-document-ai";

  constructor(
    private readonly client: DocumentAiClient,
    private readonly settings: DocumentAiSettings,
  ) {}

  async read(file: UploadedFile): Promise<{ ocrText?: string }> {
    const { project, location, processorId } = this.settings;
    try {
      const [response] = await this.client.processDocument({
        name: `projects/${project}/locations/${location}/processors/${processorId}`,
        rawDocument: { content: Buffer.from(file.bytes).toString("base64"), mimeType: file.mediaType },
      });
      const text = response.document?.text;
      return text ? { ocrText: text } : {};
    } catch (error) {
      throw new OcrError("Google Document AI could not read the file.", { cause: error });
    }
  }
}
