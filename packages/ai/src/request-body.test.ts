import { describe, expect, it } from "vitest";
import { BodyTooLargeError, readBodyBytes, readBodyText } from "./request-body.ts";

function streamOf(chunks: Uint8Array[], onCancel: () => void = () => {}): ReadableStream<Uint8Array> {
  let index = 0;
  return new ReadableStream({
    pull(controller) {
      const chunk = chunks[index++];
      if (chunk) controller.enqueue(chunk);
      else controller.close();
    },
    cancel: onCancel,
  });
}

function streamedRequest(body: ReadableStream<Uint8Array>, headers: HeadersInit = {}): Request {
  return new Request("https://demo.example/api", { method: "POST", body, headers, duplex: "half" } as RequestInit);
}

describe("readBodyText", () => {
  it("returns a body within the cap", async () => {
    const request = new Request("https://demo.example/api", { method: "POST", body: "héllo" });
    await expect(readBodyText(request, 100)).resolves.toBe("héllo");
  });

  it("rejects a declared Content-Length over the cap without reading", async () => {
    // A body that never sends a byte: reading it would hang, so a rejection proves it was not read.
    const body = new ReadableStream<Uint8Array>({ pull: () => new Promise(() => {}) });
    const request = streamedRequest(body, { "content-length": "101" });
    await expect(readBodyBytes(request, 100)).rejects.toBeInstanceOf(BodyTooLargeError);
  });

  it("stops reading a streamed body once it passes the cap", async () => {
    let cancelled = false;
    const chunk = new Uint8Array(40);
    const request = streamedRequest(
      streamOf([chunk, chunk, chunk, chunk, chunk], () => {
        cancelled = true;
      }),
    );
    await expect(readBodyBytes(request, 100)).rejects.toBeInstanceOf(BodyTooLargeError);
    expect(cancelled).toBe(true);
  });

  it("accepts a body of exactly the cap", async () => {
    const request = streamedRequest(streamOf([new Uint8Array(60), new Uint8Array(40)]));
    await expect(readBodyBytes(request, 100)).resolves.toHaveLength(100);
  });

  it("returns an empty body for a request without one", async () => {
    await expect(readBodyBytes(new Request("https://demo.example/api"), 100)).resolves.toHaveLength(0);
  });
});
