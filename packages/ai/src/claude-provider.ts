import Anthropic, {
  APIConnectionError,
  APIConnectionTimeoutError,
  APIError,
  AuthenticationError,
  BadRequestError,
  InternalServerError,
  PermissionDeniedError,
  RateLimitError,
} from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { AiOutputError, AiRefusalError, AiUnavailableError, isAiError } from "./errors.ts";
import { guards } from "./guards.ts";
import type { AiProvider, ObjectRequest, TextRequest } from "./provider.ts";
import { baseParams, effortFor } from "./claude-request.ts";

type BetaMessage = Anthropic.Beta.Messages.BetaMessage;

/**
 * The part of the Anthropic client this provider uses. Tests pass a fake with the same shape.
 * Every call uses the beta namespace because server-side refusal fallbacks are typed only there.
 */
export type ClaudeClient = {
  beta: { messages: Pick<Anthropic["beta"]["messages"], "create" | "stream"> };
};

export type ClaudeProviderOptions = {
  /** Caps `maxTokens`. Defaults to the shared AI_MAX_OUTPUT_TOKENS guard. */
  clampMaxTokens?: (requested?: number) => number;
};

/** Read the stop reason before the content: a refused or cut answer must never reach a customer. */
function assertComplete(message: Pick<BetaMessage, "stop_reason" | "stop_details">) {
  if (message.stop_reason === "refusal") {
    throw new AiRefusalError(message.stop_details?.category ?? null);
  }
  if (message.stop_reason === "max_tokens") {
    throw new AiOutputError("max_tokens", "The answer hit the output token limit.");
  }
}

/** With a refusal fallback, the text after the last fallback block is the model that answered. */
function answerText(message: BetaMessage): string {
  const lastFallback = message.content.findLastIndex((block) => block.type === "fallback");
  return message.content
    .slice(lastFallback + 1)
    .flatMap((block) => (block.type === "text" ? [block.text] : []))
    .join("");
}

/** Most specific class first: a timeout is also a connection error, every class is an APIError. */
export function toAiError(error: unknown): unknown {
  if (isAiError(error)) return error;
  const wrap = (kind: AiUnavailableError["kind"]) =>
    new AiUnavailableError(kind, error instanceof Error ? error.message : String(error), {
      cause: error,
    });
  if (error instanceof APIConnectionTimeoutError) return wrap("timeout");
  if (error instanceof APIConnectionError) return wrap("connection");
  if (error instanceof AuthenticationError || error instanceof PermissionDeniedError) {
    return wrap("auth");
  }
  if (error instanceof RateLimitError) return wrap("rate_limited");
  if (error instanceof BadRequestError) return wrap("bad_request");
  if (error instanceof InternalServerError) return wrap("server");
  if (error instanceof APIError) return wrap("unknown");
  return error;
}

export class ClaudeProvider implements AiProvider {
  readonly name = "claude";
  private readonly clampMaxTokens: (requested?: number) => number;

  constructor(
    private readonly client: ClaudeClient,
    options: ClaudeProviderOptions = {},
  ) {
    this.clampMaxTokens = options.clampMaxTokens ?? guards.clampMaxTokens;
  }

  async *streamText(request: TextRequest): AsyncIterable<string> {
    try {
      const stream = this.client.beta.messages.stream({
        ...baseParams(request, this.clampMaxTokens(request.maxTokens)),
        output_config: { effort: effortFor(request.role) },
      });
      for await (const event of stream) {
        if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
          yield event.delta.text;
        }
      }
      assertComplete(await stream.finalMessage());
    } catch (error) {
      throw toAiError(error);
    }
  }

  async generateText(request: TextRequest): Promise<string> {
    try {
      const message = await this.client.beta.messages.create({
        ...baseParams(request, this.clampMaxTokens(request.maxTokens)),
        output_config: { effort: effortFor(request.role) },
      });
      assertComplete(message);
      return answerText(message);
    } catch (error) {
      throw toAiError(error);
    }
  }

  /**
   * Uses `create` with the zod output format rather than `parse`: `parse` reads the text before
   * the stop reason can be checked, so a refusal would surface as a JSON error.
   */
  async generateObject<T>(request: ObjectRequest<T>): Promise<T> {
    try {
      const message = await this.client.beta.messages.create({
        ...baseParams(request, this.clampMaxTokens(request.maxTokens)),
        output_config: {
          effort: effortFor(request.role),
          format: betaZodOutputFormat(request.schema),
        },
      });
      assertComplete(message);
      return parseOutput(answerText(message), request.schema);
    } catch (error) {
      throw toAiError(error);
    }
  }
}

function parseOutput<T>(text: string, schema: ObjectRequest<T>["schema"]): T {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch (error) {
    throw new AiOutputError("invalid_output", "The answer is not valid JSON.", { cause: error });
  }
  const result = schema.safeParse(json);
  if (!result.success) {
    throw new AiOutputError("invalid_output", "The answer does not match the schema.", {
      cause: result.error,
    });
  }
  return result.data;
}
