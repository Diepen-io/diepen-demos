import type { CheckResult } from "@/domain/check-result";
import { applyCheckRules } from "@/domain/check-rules";
import { createTaxReturnRequest, requestItem, requestSentAt, type UploadItemId } from "@/domain/document-request";
import { folderFor } from "@/domain/drive-folder";
import { extensionFor, fileNameFor } from "@/domain/file-naming";
import { sampleNamed } from "@/domain/sample-documents";
import type { AiProvider } from "@diepen/ai/provider";
import type { CompanyProfile } from "@diepen/voice/profile";
import { buildSystemPrompt } from "@diepen/voice/prompt";
import { documentCheckSchema, documentCheckTask } from "@diepen/voice/tasks/document-check";
import type { FileStore } from "./ports/file-store";
import type { OcrService, UploadedFile } from "./ports/ocr-service";

export type CheckUploadInput = {
  file: UploadedFile;
  itemId: UploadItemId;
  profile: CompanyProfile;
  /** The route passes the guard's clamp; one check never needs more. */
  maxTokens?: number;
};

export type CheckUploadPorts = { provider: AiProvider; ocr: OcrService; fileStore: FileStore };

export type CheckUploadOutcome = {
  check: CheckResult;
  itemEvent: "checkPassed" | "checkFailed";
  filing: { folder: string; fileName: string };
};

const maxCheckTokens = 1200;

/** The keyless answer for a file the samples do not cover. */
const unknownDocument: CheckResult = {
  documentType: "Unknown document",
  matchesRequest: true,
  person: null,
  year: null,
  issues: [{ kind: "other", detail: "Demo answers only cover the sample files. Pick a sample to see a full check." }],
  keyFigures: [],
  summary: "The demo has no recorded answer for this file. With an API key, Claude reads it.",
  status: "problem",
};

/** The mock provider answers with the recorded result of a sample, keyed on the file name. */
function recordedCheck(fileName: string, itemId: UploadItemId): CheckResult {
  const sample = sampleNamed(fileName);
  if (!sample) return unknownDocument;
  return { ...sample.result, matchesRequest: sample.itemId === itemId };
}

function base64(bytes: Uint8Array): string {
  return Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength).toString("base64");
}

/** Reads one upload, checks it against the request, names it and files it. */
export async function checkUploadedDocument(input: CheckUploadInput, ports: CheckUploadPorts): Promise<CheckUploadOutcome> {
  const { file, itemId, profile } = input;
  const request = createTaxReturnRequest(requestSentAt);
  const item = requestItem(itemId);
  const { ocrText } = await ports.ocr.read(file);

  const answer = await ports.provider.generateObject({
    role: documentCheckTask.role,
    system: buildSystemPrompt({
      profile,
      task: documentCheckTask,
      context: { requestedDocument: item.label, clientName: request.client.name, taxYear: request.taxYear, ocrText },
    }),
    messages: [
      {
        role: "user",
        content: `Check the attached file "${file.name}" against the requested document.`,
        attachments: [{ name: file.name, mediaType: file.mediaType, base64: base64(file.bytes) }],
      },
    ],
    schema: documentCheckSchema,
    maxTokens: Math.min(input.maxTokens ?? maxCheckTokens, maxCheckTokens),
    mock: () => recordedCheck(file.name, itemId),
  });

  const check = applyCheckRules(answer, item, request);
  const status = check.status;
  const filing = { folder: folderFor({ itemId, status }), fileName: fileNameFor(item, check, extensionFor(file.mediaType)) };
  await ports.fileStore.save({ ...filing, file });
  return { check, itemEvent: status === "ok" ? "checkPassed" : "checkFailed", filing };
}
