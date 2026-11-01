import { guards as sharedGuards, type Guards } from "@diepen/ai/guards";
import type { AiProvider } from "@diepen/ai/provider";
import { getProvider } from "@diepen/ai/provider-factory";
import { fetchPage as webPageFetcher, type PageFetcher } from "@diepen/voice/page-fetcher";
import { answerInquiry, type Inquiry } from "@/application/answer-inquiry";
import { fixturePageFetcher } from "./fixture-page-fetcher";

/**
 * The one place that picks the adapters. Routes take everything from here; a test builds its own
 * container with a stub provider or guards that trip on the first request.
 */
export type ContainerOptions = { provider?: AiProvider; guards?: Guards };

export function createContainer({ provider = getProvider(), guards = sharedGuards }: ContainerOptions = {}) {
  // Without a key nothing may leave the server, so "Make it yours" reads a fixture page.
  const fetchPage: PageFetcher = provider.name === "mock" ? fixturePageFetcher : webPageFetcher;
  return {
    provider,
    providerName: provider.name,
    guards,
    fetchPage,
    answerInquiry: (inquiry: Inquiry) => answerInquiry({ ai: provider }, inquiry),
  };
}

export type Container = ReturnType<typeof createContainer>;

export const container: Container = createContainer();
