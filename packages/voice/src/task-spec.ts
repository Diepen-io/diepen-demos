import type { ModelRole } from "@diepen/ai/models";
import type { z } from "zod";

/** One value in the volatile context section of a system prompt. */
export type ContextValue = string | number | boolean | readonly string[] | undefined;

export type TaskContext = Record<string, ContextValue>;

/**
 * One AI job in a demo, for example answering an inbox message. `buildSystemPrompt` places the
 * instructions after the company sections and before the context.
 */
export type TaskSpec<Context extends TaskContext, Output = string> = {
  id: string;
  role: ModelRole;
  /**
   * The task part of the prompt. Use only context that stays the same for a whole conversation
   * (a channel, a document type), never a time or a list of slots, so the prompt prefix caches.
   */
  instructions: (context: Context) => string;
  /** Present when the result is structured. */
  outputSchema?: z.ZodType<Output>;
};
