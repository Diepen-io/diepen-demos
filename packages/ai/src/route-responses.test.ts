import { describe, expect, it, vi } from "vitest";
import { fallbackResponse, textStreamResponse, unavailableResponse } from "./route-responses.ts";
import { providerOf, readFallback, readTextStream } from "./text-stream-client.ts";

async function* chunks(...values: string[]) {
  for (const value of values) yield await Promise.resolve(value);
}

async function* failingAfter(value: string) {
  yield await Promise.resolve(value);
  throw new Error("connection lost");
}

describe("fallbackResponse", () => {
  it("answers 429 with the film fallback for limits", async () => {
    const response = fallbackResponse({ ok: false, reason: "rate_limit", message: "Busy." });
    expect(response.status).toBe(429);
    await expect(readFallback(response)).resolves.toEqual({
      fallback: "film",
      reason: "rate_limit",
      message: "Busy.",
    });
  });

  it("answers 413 for input that is too large", () => {
    const response = fallbackResponse({ ok: false, reason: "input_too_large", message: "Long." });
    expect(response.status).toBe(413);
  });
});

describe("unavailableResponse", () => {
  it("answers 503 with reason unavailable and logs the error", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const response = unavailableResponse(new Error("down"));
    expect(response.status).toBe(503);
    await expect(readFallback(response)).resolves.toMatchObject({ reason: "unavailable" });
    expect(log).toHaveBeenCalled();
    log.mockRestore();
  });
});

describe("textStreamResponse", () => {
  it("streams plain text and names the provider", async () => {
    const response = textStreamResponse(chunks("Hello ", "there"), "mock");
    expect(response.headers.get("content-type")).toBe("text/plain; charset=utf-8");
    expect(providerOf(response)).toBe("mock");
    await expect(readFallback(response)).resolves.toBeNull();

    const deltas: string[] = [];
    await expect(readTextStream(response, (d) => deltas.push(d))).resolves.toBe("Hello there");
    expect(deltas.join("")).toBe("Hello there");
  });

  it("ends the stream cleanly when the source fails midway", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const response = textStreamResponse(failingAfter("Partial"), "claude");
    await expect(readTextStream(response, () => undefined)).resolves.toBe("Partial");
    log.mockRestore();
  });
});

describe("readFallback", () => {
  it("returns null for an error body that is not a fallback", async () => {
    await expect(readFallback(Response.json({ error: "x" }, { status: 400 }))).resolves.toBeNull();
    await expect(readFallback(new Response("oops", { status: 500 }))).resolves.toBeNull();
  });

  it("reads no provider from a response without the header", () => {
    expect(providerOf(new Response("x"))).toBeNull();
  });
});
