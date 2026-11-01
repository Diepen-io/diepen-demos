import type { z } from "zod";
import type { ModelRole } from "./models.ts";

/** A file Claude reads, for example a scanned tax form in the document chaser. */
export type Attachment = {
  name: string;
  mediaType: "application/pdf" | "image/png" | "image/jpeg";
  base64: string;
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  attachments?: Attachment[];
};

type BaseRequest = {
  role: ModelRole;
  system: string;
  messages: ChatMessage[];
  /** Clamped to the AI_MAX_OUTPUT_TOKENS guard. */
  maxTokens?: number;
};

export type TextRequest = BaseRequest & {
  /** What the mock provider answers. Tests and keyless live mode use it. */
  mock: () => string;
};

export type ObjectRequest<T> = BaseRequest & {
  schema: z.ZodType<T>;
  mock: () => T;
};

export interface AiProvider {
  readonly name: "claude" | "mock";
  streamText(request: TextRequest): AsyncIterable<string>;
  generateText(request: TextRequest): Promise<string>;
  generateObject<T>(request: ObjectRequest<T>): Promise<T>;
}
