import { guards as sharedGuards, type Guards } from "@diepen/ai/guards";
import type { AiProvider } from "@diepen/ai/provider";
import { getProvider } from "@diepen/ai/provider-factory";
import { pageFetcherFor } from "@diepen/voice/fixture-page-fetcher";
import type { CompanyProfile } from "@diepen/voice/profile";
import { chaseMissingDocuments, sendDueChase, type ChaseEvent, type SentChase } from "@/application/chase-missing-documents";
import { checkUploadedDocument, type CheckUploadInput, type CheckUploadOutcome } from "@/application/check-uploaded-document";
import type { OcrService } from "@/application/ports/ocr-service";
import type { LiveSession } from "@/domain/live-session";
import { chaseIntervalDays } from "@/domain/reminder-schedule";
import { addWorkingDays } from "@/domain/story-time";
import { ClaudeDocumentReader } from "./claude-document-reader";
import { documentAiClientOptions, GoogleDocumentAiOcr } from "./google-document-ai-ocr";
import { InProcessScheduler } from "./in-process-scheduler";
import { readOcrSettings } from "./ocr-settings";
import { SimulatedDriveStore } from "./simulated-drive-store";

/**
 * The one place that picks the adapters. Routes take everything from here; a test builds its own
 * container with a stub provider or guards that trip on the first request.
 */
export type ContainerOptions = { provider?: AiProvider; guards?: Guards };

async function createOcrService(): Promise<OcrService> {
  const settings = readOcrSettings();
  if (settings.provider === "claude") return new ClaudeDocumentReader();
  // Loaded only when chosen, so the default deploy never pulls in the Google client.
  const { DocumentProcessorServiceClient } = await import("@google-cloud/documentai");
  return new GoogleDocumentAiOcr(new DocumentProcessorServiceClient(documentAiClientOptions(settings)), settings);
}

/**
 * Records the event, then moves the story clock: to now for "Done for now", three days on for
 * "Skip 3 days", past a weekend to Monday like the schedule. Every chase that falls due on the way
 * is sent, in order.
 */
async function runChase(
  session: LiveSession,
  profile: CompanyProfile,
  event: ChaseEvent,
): Promise<{ session: LiveSession; sent: SentChase[] }> {
  const scheduler = new InProcessScheduler(session.jobs.map((job) => ({ ...job, requestId: session.requestId })));
  const target = event === "skip-days" ? addWorkingDays(session.now, chaseIntervalDays) : session.now;
  let current = await chaseMissingDocuments({ session, profile, event, now: target }, { scheduler });
  const sent: SentChase[] = [];
  await scheduler.advanceTo(target, async (job) => {
    const result = await sendDueChase(job, current, profile, { scheduler });
    current = result.session;
    if (result.sent) sent.push(result.sent);
  });
  return { session: { ...current, jobs: scheduler.pending().map(({ id, runAt }) => ({ id, runAt })) }, sent };
}

export function createContainer({ provider = getProvider(), guards = sharedGuards }: ContainerOptions = {}) {
  const fileStore = new SimulatedDriveStore();
  let ocr: Promise<OcrService> | undefined;

  function ocrService(): Promise<OcrService> {
    ocr ??= createOcrService().catch((error: unknown) => {
      ocr = undefined;
      throw error;
    });
    return ocr;
  }

  return {
    provider,
    providerName: provider.name,
    guards,
    fetchPage: pageFetcherFor(provider.name),
    /** Which OCR adapter runs. Throws an error that names each missing setting. */
    ocrName: (): OcrService["name"] => readOcrSettings().provider,
    async checkDocument(input: CheckUploadInput): Promise<CheckUploadOutcome & { ocr: OcrService["name"] }> {
      const ocrAdapter = await ocrService();
      const outcome = await checkUploadedDocument(input, { provider, ocr: ocrAdapter, fileStore });
      return { ...outcome, ocr: ocrAdapter.name };
    },
    runChase,
  };
}

export type Container = ReturnType<typeof createContainer>;

export const container: Container = createContainer();
