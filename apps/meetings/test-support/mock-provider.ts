import { MockProvider } from "@diepen/ai/mock-provider";
import type { AiProvider } from "@diepen/ai/provider";

/**
 * The package's mock adapter for unit tests. Tests wire adapters like a composition root does, but
 * the layer lint keeps adapters out of application/, so its tests take the adapter from here.
 */
export function createMockProvider(): AiProvider {
  return new MockProvider();
}
