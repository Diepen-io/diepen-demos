import { guards as sharedGuards, type Guards } from "@diepen/ai/guards";
import type { AiProvider } from "@diepen/ai/provider";
import { getProvider } from "@diepen/ai/provider-factory";
import { pageFetcherFor } from "@diepen/voice/fixture-page-fetcher";
import { processCall, type ProcessCallInput } from "@/application/process-call";

/**
 * The one place that picks the adapters. Routes take everything from here; a test builds its own
 * container with a stub provider or guards that trip on the first request.
 */
export type ContainerOptions = { provider?: AiProvider; guards?: Guards };

export function createContainer({ provider = getProvider(), guards = sharedGuards }: ContainerOptions = {}) {
  return {
    provider,
    providerName: provider.name,
    guards,
    fetchPage: pageFetcherFor(provider.name),
    processCall: (input: ProcessCallInput) => processCall(input, { ai: provider }),
  };
}

export type Container = ReturnType<typeof createContainer>;

export const container: Container = createContainer();
