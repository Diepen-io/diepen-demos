import { describe, expect, it } from "vitest";
import { z } from "zod";
import { MockProvider, wordChunks } from "./mock-provider.ts";
import type { TextRequest } from "./provider.ts";

const request: TextRequest = {
  role: "chat",
  system: "",
  messages: [{ role: "user", content: "Hi" }],
  mock: () => "Thanks for asking.\nWe open at 8.",
};

describe("MockProvider", () => {
  it("streams the mock text in word chunks that join back exactly", async () => {
    const chunks: string[] = [];
    for await (const chunk of new MockProvider().streamText(request)) chunks.push(chunk);
    expect(chunks).toEqual(["Thanks ", "for ", "asking.\n", "We ", "open ", "at ", "8."]);
    expect(chunks.join("")).toBe(request.mock());
  });

  it("returns the mock text and the mock object", async () => {
    const provider = new MockProvider();
    await expect(provider.generateText(request)).resolves.toBe(request.mock());
    const schema = z.object({ status: z.literal("ok") });
    await expect(
      provider.generateObject({ ...request, schema, mock: () => ({ status: "ok" as const }) }),
    ).resolves.toEqual({ status: "ok" });
  });

  it("rejects a mock that does not match its schema, so fixtures stay honest", async () => {
    const schema = z.object({ status: z.literal("ok") });
    const mock = () => ({ status: "wrong" }) as unknown as { status: "ok" };
    await expect(new MockProvider().generateObject({ ...request, schema, mock })).rejects.toThrow();
  });

  it("splits leading whitespace into its own chunk", () => {
    expect(wordChunks("  a b")).toEqual(["  ", "a ", "b"]);
    expect(wordChunks("")).toEqual([]);
  });
});
