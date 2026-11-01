/**
 * The browser side of a live AI route. App UI may import only this module from `@diepen/ai`, so it
 * imports nothing: no SDK, no server code.
 */

export type AiFallbackReason = "rate_limit" | "daily_cap" | "input_too_large" | "unavailable";

/** The body a route sends when the demo must show the film instead of a live answer. */
export type AiFallback = {
  fallback: "film";
  reason: AiFallbackReason;
  message: string;
};

export type AiProviderName = "claude" | "mock";

export const providerHeader = "x-ai-provider";

const fallbackReasons: readonly string[] = [
  "rate_limit",
  "daily_cap",
  "input_too_large",
  "unavailable",
] satisfies AiFallbackReason[];

function isAiFallback(value: unknown): value is AiFallback {
  if (typeof value !== "object" || value === null) return false;
  const body = value as Record<string, unknown>;
  return (
    body.fallback === "film" &&
    typeof body.reason === "string" &&
    fallbackReasons.includes(body.reason) &&
    typeof body.message === "string"
  );
}

/** Reads a streamed text answer, calling `onDelta` with each new piece. Resolves with the full text. */
export async function readTextStream(
  response: Response,
  onDelta: (delta: string) => void,
): Promise<string> {
  if (!response.body) return "";
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let text = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) return text;
    text += value;
    onDelta(value);
  }
}

/** The fallback body when the route asked for film mode, else `null`. Reads the body only on errors. */
export async function readFallback(response: Response): Promise<AiFallback | null> {
  if (response.ok) return null;
  try {
    const body: unknown = await response.json();
    return isAiFallback(body) ? body : null;
  } catch {
    return null;
  }
}

/** Which provider answered, so the screen can say "Demo answers, no API key set". */
export function providerOf(response: Response): AiProviderName | null {
  const name = response.headers.get(providerHeader);
  return name === "claude" || name === "mock" ? name : null;
}
