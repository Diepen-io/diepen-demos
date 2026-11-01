/**
 * Errors every provider throws, so a route can catch them without knowing the SDK and fall back
 * to film mode.
 */

/** Why the model could not be reached. Routes only need to know it failed; logs need the kind. */
export type UnavailableKind =
  | "timeout"
  | "connection"
  | "auth"
  | "rate_limited"
  | "bad_request"
  | "server"
  | "unknown";

/** Claude could not be reached or rejected the request before answering. */
export class AiUnavailableError extends Error {
  override readonly name = "AiUnavailableError";

  constructor(
    readonly kind: UnavailableKind,
    message: string,
    options?: { cause?: unknown },
  ) {
    super(message, options);
  }
}

/** The model declined to answer. `category` is the API's refusal category when it gave one. */
export class AiRefusalError extends Error {
  override readonly name = "AiRefusalError";

  constructor(readonly category: string | null = null) {
    super(category ? `The model declined to answer (${category}).` : "The model declined to answer.");
  }
}

/** The model answered, but the answer is cut off or does not match the requested shape. */
export class AiOutputError extends Error {
  override readonly name = "AiOutputError";

  constructor(
    readonly kind: "max_tokens" | "invalid_output",
    message: string,
    options?: { cause?: unknown },
  ) {
    super(message, options);
  }
}

export type AiError = AiUnavailableError | AiRefusalError | AiOutputError;

export function isAiError(error: unknown): error is AiError {
  return (
    error instanceof AiUnavailableError ||
    error instanceof AiRefusalError ||
    error instanceof AiOutputError
  );
}
