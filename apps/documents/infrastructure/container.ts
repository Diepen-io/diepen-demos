import { chaseMissingDocuments, sendDueChase, type ChaseEvent, type SentChase } from "@/application/chase-missing-documents";
import { checkUploadedDocument, type CheckUploadInput, type CheckUploadOutcome } from "@/application/check-uploaded-document";
import type { OcrService } from "@/application/ports/ocr-service";
import type { LiveSession } from "@/domain/live-session";
import { chaseIntervalDays } from "@/domain/reminder-schedule";
import { addDays } from "@/domain/story-time";
import { activeProviderName, getProvider } from "@diepen/ai/provider-factory";
import { createBrandHandler } from "@diepen/voice/brand-route";
import { fetchPage } from "@diepen/voice/page-fetcher";
import type { CompanyProfile } from "@diepen/voice/profile";
import { ClaudeDocumentReader } from "./claude-document-reader";
import { fixturePageFetcher } from "./fixture-page-fetcher";
import { documentAiClientOptions, GoogleDocumentAiOcr } from "./google-document-ai-ocr";
import { InProcessScheduler } from "./in-process-scheduler";
import { readOcrSettings } from "./ocr-settings";
import { SimulatedDriveStore } from "./simulated-drive-store";

/** The one place that picks adapters. Routes call these functions and nothing else in this folder. */

const fileStore = new SimulatedDriveStore();
let ocr: Promise<OcrService> | undefined;

async function createOcrService(): Promise<OcrService> {
  const settings = readOcrSettings();
  if (settings.provider === "claude") return new ClaudeDocumentReader();
  // Loaded only when chosen, so the default deploy never pulls in the Google client.
  const { DocumentProcessorServiceClient } = await import("@google-cloud/documentai");
  return new GoogleDocumentAiOcr(new DocumentProcessorServiceClient(documentAiClientOptions(settings)), settings);
}

function ocrService(): Promise<OcrService> {
  ocr ??= createOcrService().catch((error: unknown) => {
    ocr = undefined;
    throw error;
  });
  return ocr;
}

/** Which OCR adapter runs. Throws an error that names each missing setting. */
export function activeOcrName(): OcrService["name"] {
  return readOcrSettings().provider;
}

export { activeProviderName };

export async function checkDocument(input: CheckUploadInput): Promise<CheckUploadOutcome & { ocr: OcrService["name"] }> {
  const ocrAdapter = await ocrService();
  const outcome = await checkUploadedDocument(input, { provider: getProvider(), ocr: ocrAdapter, fileStore });
  return { ...outcome, ocr: ocrAdapter.name };
}

/**
 * Records the event, then moves the story clock: to now for "Done for now", three days on for
 * "Skip 3 days". Every chase that falls due on the way is sent, in order.
 */
export async function runChase(
  session: LiveSession,
  profile: CompanyProfile,
  event: ChaseEvent,
): Promise<{ session: LiveSession; sent: SentChase[] }> {
  const scheduler = new InProcessScheduler(session.jobs.map((job) => ({ ...job, requestId: session.requestId })));
  const target = event === "skip-days" ? addDays(session.now, chaseIntervalDays) : session.now;
  let current = await chaseMissingDocuments({ session, profile, event, now: target }, { scheduler });
  const sent: SentChase[] = [];
  await scheduler.advanceTo(target, async (job) => {
    const result = await sendDueChase(job, current, profile, { scheduler });
    current = result.session;
    if (result.sent) sent.push(result.sent);
  });
  return { session: { ...current, jobs: scheduler.pending().map(({ id, runAt }) => ({ id, runAt })) }, sent };
}

const liveBrandHandler = createBrandHandler({ fetchPage });
const fixtureBrandHandler = createBrandHandler({ fetchPage: fixturePageFetcher });

/** "Make it yours" reads the visitor's website, or a fixture page while the mock provider answers. */
export function handleBrandRequest(request: Request): Promise<Response> {
  return activeProviderName() === "mock" ? fixtureBrandHandler(request) : liveBrandHandler(request);
}
