import type { GuardResult } from "./guards.ts";
import type { AiProvider } from "./provider.ts";
import { providerHeader, type AiFallback } from "./text-stream-client.ts";

type GuardTripResult = Extract<GuardResult, { ok: false }>;

const unavailableMessage = "The live demo is not available right now. Here is the recorded film.";

function json(body: AiFallback, status: number): Response {
  return Response.json(body, { status, headers: { "cache-control": "no-store" } });
}

/** A guard tripped: tell the app to show the film. Input that is too large is a 413, limits a 429. */
export function fallbackResponse(result: GuardTripResult): Response {
  const status = result.reason === "input_too_large" ? 413 : 429;
  return json({ fallback: "film", reason: result.reason, message: result.message }, status);
}

/** The model failed before the answer started. The error goes to the server log, not the visitor. */
export function unavailableResponse(error: unknown): Response {
  console.error("AI request failed", error);
  return json({ fallback: "film", reason: "unavailable", message: unavailableMessage }, 503);
}

/**
 * Streams model text to the browser as plain text. An error after the first byte cannot change the
 * status any more, so the stream ends where it is and the error goes to the server log.
 */
export function textStreamResponse(
  stream: AsyncIterable<string>,
  provider: AiProvider["name"],
): Response {
  const iterator: AsyncIterator<string, unknown> = stream[Symbol.asyncIterator]();
  const encoder = new TextEncoder();

  const body = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const next = await iterator.next();
        if (next.done) controller.close();
        else controller.enqueue(encoder.encode(next.value));
      } catch (error) {
        console.error("AI stream ended early", error);
        controller.close();
      }
    },
    async cancel() {
      await iterator.return?.();
    },
  });

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
      [providerHeader]: provider,
    },
  });
}
