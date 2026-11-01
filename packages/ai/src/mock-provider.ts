import type { AiProvider, ObjectRequest, TextRequest } from "./provider.ts";

const defaultDelayMs = 18;

/** Under Vitest the delay is zero so tests stay fast; elsewhere it makes the mock read like typing. */
function delayFromEnv(): number {
  if (process.env.VITEST) return 0;
  const value = Number(process.env.AI_MOCK_DELAY_MS);
  return Number.isFinite(value) && value >= 0 ? value : defaultDelayMs;
}

function wait(ms: number): Promise<void> {
  return ms > 0 ? new Promise((resolve) => setTimeout(resolve, ms)) : Promise.resolve();
}

/** Splits text into words that keep their trailing whitespace, so the chunks join back exactly. */
export function wordChunks(text: string): string[] {
  return text.match(/\S+\s*|\s+/g) ?? [];
}

/** Answers every request with the request's own `mock`. Used in tests and without an API key. */
export class MockProvider implements AiProvider {
  readonly name = "mock";
  private readonly delayMs: number;

  constructor(options: { delayMs?: number } = {}) {
    this.delayMs = options.delayMs ?? delayFromEnv();
  }

  async *streamText(request: TextRequest): AsyncIterable<string> {
    for (const chunk of wordChunks(request.mock())) {
      await wait(this.delayMs);
      yield chunk;
    }
  }

  generateText(request: TextRequest): Promise<string> {
    return Promise.resolve(request.mock());
  }

  generateObject<T>(request: ObjectRequest<T>): Promise<T> {
    return Promise.resolve().then(() => request.schema.parse(request.mock()));
  }
}
