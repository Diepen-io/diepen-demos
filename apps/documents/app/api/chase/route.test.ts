import { liveSessionSchema } from "@/domain/live-session";
import { filmSession } from "@/test-support/live-sessions";
import { presets } from "@diepen/voice/presets";
import { describe, expect, it } from "vitest";
import { POST } from "./route";

function post(body: unknown) {
  const text = typeof body === "string" ? body : JSON.stringify(body);
  return new Request("https://documents.demo.example/api/chase", {
    method: "POST",
    body: text,
    headers: {
      "content-type": "application/json",
      "content-length": String(new TextEncoder().encode(text).byteLength),
    },
  });
}

describe("POST /api/chase @documents.chase", () => {
  it("answers 400 for an invalid session", async () => {
    for (const session of [undefined, {}, { ...filmSession(), items: "all of them" }, { ...filmSession(), sentAt: 42 }]) {
      const response = await POST(post({ session, event: "submitted" }));
      expect(response.status).toBe(400);
      expect(await response.json()).toMatchObject({ error: "invalid_request", issues: expect.any(Array) as unknown });
    }
  });

  it("answers 400 for a missing or unknown event", async () => {
    for (const event of [undefined, "skip-week", 3]) {
      const response = await POST(post({ session: filmSession(), event }));
      expect(response.status).toBe(400);
    }
  });

  it("answers 400 for a body that is not JSON", async () => {
    expect((await POST(post("{session"))).status).toBe(400);
  });

  it("answers 413 for a body over 64 KB", async () => {
    const response = await POST(post({ session: filmSession(), event: "submitted", padding: "x".repeat(65_536) }));
    expect(response.status).toBe(413);
    expect(await response.json()).toEqual({ error: "body_too_large", maxBytes: 65_536 });
  });

  it("answers 200 with the session and the chases sent", async () => {
    const response = await POST(post({ session: filmSession(), event: "submitted", profile: presets["ledgerwick-accounting"] }));
    expect(response.status).toBe(200);
    const body = (await response.json()) as { session: unknown; sent: Record<string, unknown>[] };
    expect(Object.keys(body).sort()).toEqual(["sent", "session"]);
    expect(liveSessionSchema.safeParse(body.session).success).toBe(true);
    expect(body.sent).toHaveLength(1);
    const [followUp] = body.sent;
    expect(followUp).toMatchObject({ kind: "follow-up", to: "client" });
    expect(Object.keys(followUp ?? {}).sort()).toEqual(["body", "id", "kind", "outstanding", "sentAt", "subject", "to"]);
    expect(followUp?.outstanding).toEqual([
      { itemId: "bank-interest", reason: "You sent the one for 2024." },
      { itemId: "home-office", reason: "The signature is missing." },
      { itemId: "health-insurance", reason: "Not received yet." },
    ]);
  });

  it("uses the default preset when no profile is sent", async () => {
    const response = await POST(post({ session: filmSession(), event: "submitted" }));
    expect(response.status).toBe(200);
    const body = (await response.json()) as { sent: { body: string }[] };
    expect(body.sent[0]?.body).toContain("Clara from Ledgerwick");
  });
});
