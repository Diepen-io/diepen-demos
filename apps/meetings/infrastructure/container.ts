import { guards, type Guards } from "@diepen/ai/guards";
import type { AiProvider } from "@diepen/ai/provider";
import { getProvider } from "@diepen/ai/provider-factory";
import { createBrandHandler } from "@diepen/voice/brand-route";
import { fetchPage, type PageFetcher } from "@diepen/voice/page-fetcher";
import { processCall, type ProcessCallInput } from "@/application/process-call";
import type { MeetingOutputs } from "@/domain/meeting-outputs";
import { fixturePageFetcher } from "./fixture-page-fetcher";

/** Everything the routes need, wired once per server instance. The one composition root. */
export type Container = {
  provider: AiProvider;
  providerName: AiProvider["name"];
  guards: Guards;
  processCall: (input: ProcessCallInput) => Promise<MeetingOutputs>;
  handleBrandRequest: (request: Request) => Promise<Response>;
};

function createContainer(): Container {
  // Claude with ANTHROPIC_API_KEY, else the mock provider (decision D4).
  const provider = getProvider();
  const pageFetcher: PageFetcher = provider.name === "mock" ? fixturePageFetcher : fetchPage;
  return {
    provider,
    providerName: provider.name,
    guards,
    processCall: (input) => processCall(input, { ai: provider }),
    handleBrandRequest: createBrandHandler({ fetchPage: pageFetcher, provider, guards }),
  };
}

let container: Container | undefined;

export function getContainer(): Container {
  container ??= createContainer();
  return container;
}
