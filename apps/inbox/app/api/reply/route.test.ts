import { defaultPresetFor } from "@diepen/voice/presets";
import { describe, expect, it } from "vitest";
import { POST } from "./route";

const profile = defaultPresetFor("inbox");

const validBody = {
  channel: "chat",
  profile,
  messages: [{ role: "customer", text: "How much is a check-up?" }],
  bookings: [],
  offeredSlots: [],
  now: "2026-11-10T21:42",
};

function post(body: unknown): Promise<Response> {
  return POST(
    new Request("http://localhost/api/reply", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

async function expectInvalid(body: unknown) {
  const response = await post(body);
  expect(response.status).toBe(400);
  expect(await response.json()).toMatchObject({ error: "invalid_request" });
}

describe("POST /api/reply", () => {
  it("U13: answers a valid request with the reply, the provider and the reply time", async () => {
    const response = await post(validBody);

    expect(response.status).toBe(200);
    const body: unknown = await response.json();
    expect(body).toMatchObject({ provider: "mock", reply: { status: "answered" } });
    expect(body).toHaveProperty("replyMs", expect.any(Number));
  });

  it("U13: rejects a request without a profile", async () => {
    const { profile: _profile, ...withoutProfile } = validBody;
    await expectInvalid(withoutProfile);
  });

  it("U13: rejects an unknown channel", async () => {
    await expectInvalid({ ...validBody, channel: "sms" });
  });

  it("U13: rejects a request without messages", async () => {
    await expectInvalid({ ...validBody, messages: [] });
  });

  it("U13: rejects a thread that ends with the assistant", async () => {
    await expectInvalid({
      ...validBody,
      messages: [...validBody.messages, { role: "assistant", text: "A check-up costs EUR 65." }],
    });
  });

  it("U13: rejects a customer message over 1000 characters", async () => {
    await expectInvalid({ ...validBody, messages: [{ role: "customer", text: "a".repeat(1001) }] });
  });

  it("U13: reads back an earlier answer over 1000 characters, up to 2000", async () => {
    const thread = (answer: string) => ({
      ...validBody,
      messages: [validBody.messages[0], { role: "assistant", text: answer }, { role: "customer", text: "Thanks, and on Friday?" }],
    });
    expect((await post(thread("a".repeat(1800)))).status).toBe(200);
    await expectInvalid(thread("a".repeat(2001)));
  });

  it("U13: rejects more than 20 messages", async () => {
    const messages = Array.from({ length: 21 }, (_, index) => ({
      role: index % 2 === 0 ? "customer" : "assistant",
      text: `Message ${index + 1}`,
    }));
    await expectInvalid({ ...validBody, messages });
  });

  it("U13: stops reading a streamed body without a declared length at 48 KB", async () => {
    let sent = 0;
    const endless = new ReadableStream<Uint8Array>({
      pull(controller) {
        sent += 4096;
        controller.enqueue(new Uint8Array(4096).fill(32));
      },
    });
    const response = await POST(new Request("http://localhost/api/reply", { method: "POST", body: endless, duplex: "half" } as RequestInit));

    expect(response.status).toBe(400);
    expect(sent).toBeLessThan(96 * 1024);
  });

  it("U13: rejects a body over 48 KB even when every field is valid", async () => {
    const body = { ...validBody, profile: { ...profile, tagline: "x".repeat(60_000) } };
    expect(JSON.stringify(body).length).toBeGreaterThan(48 * 1024);

    await expectInvalid(body);
  });
});
