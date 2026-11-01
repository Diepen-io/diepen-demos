import type Anthropic from "@anthropic-ai/sdk";
import { models, type ModelRole } from "./models.ts";
import type { Attachment, ChatMessage, TextRequest } from "./provider.ts";

type BetaMessageParam = Anthropic.Beta.Messages.BetaMessageParam;
type BetaContentBlockParam = Anthropic.Beta.Messages.BetaContentBlockParam;
type BetaOutputConfig = Anthropic.Beta.Messages.BetaOutputConfig;
type AnthropicBeta = Anthropic.Beta.AnthropicBeta;

/** Chat must feel instant; the analysis tasks are worth more thinking. */
const effortByRole: Record<ModelRole, NonNullable<BetaOutputConfig["effort"]>> = {
  chat: "low",
  analysis: "medium",
};

/**
 * On a policy refusal the API retries on the model's default fallback inside the same call.
 * Haiku has no server-side fallback, so only the analysis role sends it.
 */
const refusalFallbackBeta: AnthropicBeta = "server-side-fallback-2026-07-01";

function attachmentBlock(attachment: Attachment): BetaContentBlockParam {
  if (attachment.mediaType === "application/pdf") {
    return {
      type: "document",
      title: attachment.name,
      source: { type: "base64", media_type: "application/pdf", data: attachment.base64 },
    };
  }
  return {
    type: "image",
    source: { type: "base64", media_type: attachment.mediaType, data: attachment.base64 },
  };
}

/** Files go before the text of their message, which is where Claude reads them best. */
export function toClaudeMessage(message: ChatMessage): BetaMessageParam {
  if (!message.attachments?.length) return { role: message.role, content: message.content };
  return {
    role: message.role,
    content: [
      ...message.attachments.map(attachmentBlock),
      { type: "text", text: message.content },
    ],
  };
}

/** The request fields every call shares. `maxTokens` arrives already clamped by the guards. */
export function baseParams(request: Omit<TextRequest, "mock">, maxTokens: number) {
  const fallback =
    request.role === "analysis"
      ? { betas: [refusalFallbackBeta], fallbacks: "default" as const }
      : {};
  return {
    model: models[request.role],
    max_tokens: maxTokens,
    system: request.system,
    messages: request.messages.map(toClaudeMessage),
    ...fallback,
  };
}

export function effortFor(role: ModelRole): BetaOutputConfig["effort"] {
  return effortByRole[role];
}
