import Anthropic from "@anthropic-ai/sdk";
import { ClaudeProvider } from "./claude-provider.ts";
import { MockProvider } from "./mock-provider.ts";
import type { AiProvider } from "./provider.ts";

// The index signature lets Next.js's ProcessEnv, which adds a typed NODE_ENV, pass as an argument.
type ProviderEnv = Partial<Record<"AI_PROVIDER" | "ANTHROPIC_API_KEY", string>> & { readonly [name: string]: string | undefined };

/** Mock when asked for, and whenever no key is set, so a fresh checkout runs without secrets. */
export function createProvider(env: ProviderEnv = process.env): AiProvider {
  if (env.AI_PROVIDER === "mock" || !env.ANTHROPIC_API_KEY) return new MockProvider();
  return new ClaudeProvider(new Anthropic({ apiKey: env.ANTHROPIC_API_KEY }));
}

let cached: AiProvider | undefined;

/** The provider every route uses. Built once per server instance. */
export function getProvider(): AiProvider {
  cached ??= createProvider();
  return cached;
}

/** Which provider answers, without a model call. A health route reports it so the UI can show the "no API key" note at once. */
export function activeProviderName(): AiProvider["name"] {
  return getProvider().name;
}
