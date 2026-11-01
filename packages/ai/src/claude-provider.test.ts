import type Anthropic from "@anthropic-ai/sdk";
import { APIConnectionTimeoutError, BadRequestError, RateLimitError } from "@anthropic-ai/sdk";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { ClaudeProvider, type ClaudeClient } from "./claude-provider.ts";
import { AiOutputError, AiRefusalError, AiUnavailableError } from "./errors.ts";
import type { ObjectRequest, TextRequest } from "./provider.ts";

type BetaMessage = Anthropic.Beta.Messages.BetaMessage;
type Params = Record<string, unknown>;

function message(overrides: Partial<BetaMessage>): BetaMessage {
  return {
    id: "msg_test",
    type: "message",
    role: "assistant",
    model: "claude-haiku-5-5",
    content: [],
    stop_reason: "end_turn",
    stop_details: null,
    stop_sequence: null,
    usage: { input_tokens: 1, output_tokens: 1 },
    ...overrides,
  } as BetaMessage;
}

function text(value: string) {
  return { type: "text" as const, text: value, citations: null };
}

function fakeClient(reply: BetaMessage | Error, deltas: string[] = []) {
  const calls: Params[] = [];
  const respond = () => (reply instanceof Error ? Promise.reject(reply) : Promise.resolve(reply));
  const client = {
    beta: {
      messages: {
        create: (params: Params) => {
          calls.push(params);
          return respond();
        },
        stream: (params: Params) => {
          calls.push(params);
          return {
            async *[Symbol.asyncIterator]() {
              for (const delta of deltas) {
                yield await Promise.resolve({ type: "content_block_delta", index: 0, delta: { type: "text_delta", text: delta } });
              }
            },
            finalMessage: respond,
          };
        },
      },
    },
  };
  return { client: client as unknown as ClaudeClient, calls };
}

const provider = (client: ClaudeClient) => new ClaudeProvider(client, { clampMaxTokens: (n) => Math.min(n ?? 500, 500) });

const textRequest: TextRequest = {
  role: "chat",
  system: "You are Mia.",
  messages: [{ role: "user", content: "Hi" }],
  mock: () => "mock",
};

describe("ClaudeProvider request mapping", () => {
  it("sends the chat model with low effort, the clamped token limit and no fallback", async () => {
    const { client, calls } = fakeClient(message({ content: [text("Hello")] }));
    await provider(client).generateText({ ...textRequest, maxTokens: 9000 });
    expect(calls[0]).toMatchObject({
      model: "claude-haiku-5-5",
      max_tokens: 500,
      system: "You are Mia.",
      output_config: { effort: "low" },
    });
    expect(calls[0]).not.toHaveProperty("fallbacks");
  });

  it("enables the default refusal fallback with medium effort for the analysis role", async () => {
    const { client, calls } = fakeClient(message({ content: [text("{}")] }));
    await provider(client).generateText({ ...textRequest, role: "analysis" });
    expect(calls[0]).toMatchObject({
      model: "claude-sonnet-5-5",
      fallbacks: "default",
      betas: ["server-side-fallback-2026-07-01"],
      output_config: { effort: "medium" },
    });
  });

  it("puts attachments before the text of their message", async () => {
    const { client, calls } = fakeClient(message({ content: [text("ok")] }));
    await provider(client).generateText({
      ...textRequest,
      messages: [
        {
          role: "user",
          content: "Check this",
          attachments: [
            { name: "w2.pdf", mediaType: "application/pdf", base64: "UERG" },
            { name: "id.png", mediaType: "image/png", base64: "UE5H" },
          ],
        },
      ],
    });
    const [sent] = calls[0]?.messages as { content: { type: string }[] }[];
    expect(sent?.content.map((block) => block.type)).toEqual(["document", "image", "text"]);
  });
});

describe("ClaudeProvider answers", () => {
  it("streams text deltas and checks the final stop reason", async () => {
    const { client } = fakeClient(message({ content: [text("Hi there")] }), ["Hi ", "there"]);
    const chunks: string[] = [];
    for await (const chunk of provider(client).streamText(textRequest)) chunks.push(chunk);
    expect(chunks).toEqual(["Hi ", "there"]);
  });

  it("returns the validated object and sends a JSON schema format", async () => {
    const schema = z.object({ status: z.enum(["ok", "problem"]) });
    const { client, calls } = fakeClient(message({ content: [text('{"status":"ok"}')] }));
    const request: ObjectRequest<{ status: "ok" | "problem" }> = {
      ...textRequest,
      role: "analysis",
      schema,
      mock: () => ({ status: "problem" }),
    };
    await expect(provider(client).generateObject(request)).resolves.toEqual({ status: "ok" });
    expect(calls[0]).toMatchObject({ output_config: { format: { type: "json_schema" } } });
  });

  it("reads the answer after the last fallback block", async () => {
    const schema = z.object({ status: z.string() });
    const fallback = { type: "fallback", from: { model: "a" }, to: { model: "b" } };
    const { client } = fakeClient(
      message({ content: [text('{"stat'), fallback, text('{"status":"ok"}')] as BetaMessage["content"] }),
    );
    const request = { ...textRequest, role: "analysis" as const, schema, mock: () => ({ status: "x" }) };
    await expect(provider(client).generateObject(request)).resolves.toEqual({ status: "ok" });
  });

  it("throws a refusal error with the category instead of reading the content", async () => {
    const { client } = fakeClient(
      message({
        stop_reason: "refusal",
        stop_details: { type: "refusal", category: "cyber", explanation: null } as BetaMessage["stop_details"],
        content: [text("{")],
      }),
    );
    const request = { ...textRequest, schema: z.object({}), mock: () => ({}) };
    const error: unknown = await provider(client).generateObject(request).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(AiRefusalError);
    expect((error as AiRefusalError).category).toBe("cyber");
  });

  it("throws an output error when the answer hits the token limit", async () => {
    const { client } = fakeClient(message({ stop_reason: "max_tokens", content: [text("cut")] }));
    await expect(provider(client).generateText(textRequest)).rejects.toBeInstanceOf(AiOutputError);
  });

  it("throws an output error when the JSON does not match the schema", async () => {
    const { client } = fakeClient(message({ content: [text('{"status":42}')] }));
    const request = { ...textRequest, schema: z.object({ status: z.string() }), mock: () => ({ status: "" }) };
    await expect(provider(client).generateObject(request)).rejects.toMatchObject({ kind: "invalid_output" });
  });
});

describe("ClaudeProvider errors", () => {
  it.each([
    [new APIConnectionTimeoutError(), "timeout"],
    [new RateLimitError(429, undefined, "slow down", new Headers()), "rate_limited"],
    [new BadRequestError(400, undefined, "bad", new Headers()), "bad_request"],
  ])("maps SDK errors to AiUnavailableError (%s)", async (sdkError, kind) => {
    const { client } = fakeClient(sdkError);
    const error: unknown = await provider(client).generateText(textRequest).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(AiUnavailableError);
    expect((error as AiUnavailableError).kind).toBe(kind);
  });

  it("maps errors that happen while streaming", async () => {
    const { client } = fakeClient(new RateLimitError(429, undefined, "slow", new Headers()));
    const read = async () => {
      const chunks: string[] = [];
      for await (const chunk of provider(client).streamText(textRequest)) chunks.push(chunk);
      return chunks;
    };
    await expect(read()).rejects.toBeInstanceOf(AiUnavailableError);
  });

  it("leaves unrelated errors alone", async () => {
    const original = new TypeError("bug");
    const { client } = fakeClient(original);
    await expect(provider(client).generateText(textRequest)).rejects.toBe(original);
  });
});
