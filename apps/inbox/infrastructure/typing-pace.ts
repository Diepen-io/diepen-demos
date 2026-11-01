import type { AiProvider } from "@diepen/ai/provider";

/**
 * Keyless live mode answers at once, and "Replied in 0.0 s" would sell nothing on a sales call.
 * This makes the mock provider take about as long as a person typing a short reply: a base
 * delay plus a little per character, capped. Under Vitest it adds nothing, so tests stay fast.
 */
const baseMs = 700;
const perCharacterMs = 9;
const maxMs = 2400;

export function typingPaceMs(reply: unknown): number {
  const length = JSON.stringify(reply)?.length ?? 0;
  return Math.min(maxMs, baseMs + length * perCharacterMs);
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function withTypingPace(provider: AiProvider): AiProvider {
  if (provider.name !== "mock" || process.env.VITEST) return provider;
  return {
    name: provider.name,
    streamText: (request) => provider.streamText(request),
    generateText: (request) => provider.generateText(request),
    generateObject: async (request) => {
      const reply = await provider.generateObject(request);
      await wait(typingPaceMs(reply));
      return reply;
    },
  };
}
