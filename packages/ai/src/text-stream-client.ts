/**
 * The browser side of a live AI route. App UI may import only this module from `@diepen/ai`, so it
 * imports nothing: no SDK, no server code.
 */

export type AiFallbackReason = "rate_limit" | "daily_cap" | "unavailable";

/** The body a route sends when the live answer failed: a tripped cost guard, or `unavailable` when the model failed. */
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

/**
 * True when a cost guard tripped (429). Only then does an app send the visitor to the film. A failed
 * model call (503 `unavailable`) keeps them in place to try again.
 */
export async function isGuardTrip(response: Response): Promise<boolean> {
  const fallback = await readFallback(response);
  return fallback !== null && fallback.reason !== "unavailable";
}

/** Which provider answered, so the screen can say "Demo answers, no API key set". */
export function providerOf(response: Response): AiProviderName | null {
  const name = response.headers.get(providerHeader);
  return name === "claude" || name === "mock" ? name : null;
}
