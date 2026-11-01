import type { AiProvider, ObjectRequest } from "@diepen/ai/provider";
import { defaultPresetFor } from "@diepen/voice/presets";
import { describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const providerCalls = vi.hoisted(() => ({ count: 0 }));

// The route uses the app's one container. Here it is a container whose daily cap is already used up.
vi.mock("@/infrastructure/container", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/infrastructure/container")>();
  const { createGuards } = await import("@diepen/ai/guards");
  const countingProvider: AiProvider = {
    name: "mock",
    streamText: () => {
      providerCalls.count += 1;
      throw new Error("not used");
    },
    generateText: () => {
      providerCalls.count += 1;
      return Promise.reject(new Error("not used"));
    },
    generateObject: <T>(request: ObjectRequest<T>) => {
      providerCalls.count += 1;
      return Promise.resolve(request.schema.parse(request.mock()));
    },
  };
  return {
    ...actual,
    container: actual.createContainer({ provider: countingProvider, guards: createGuards({ dailyCap: 0 }) }),
  };
});

describe("POST /api/reply when a cost guard trips", () => {
  it("U14: answers 429 with the film fallback and never calls the provider", async () => {
    const response = await POST(
      new Request("http://localhost/api/reply", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          channel: "chat",
          profile: defaultPresetFor("inbox"),
          messages: [{ role: "customer", text: "Can I book a time this week?" }],
          bookings: [],
          offeredSlots: [],
          now: "2026-11-10T21:42",
        }),
      }),
    );

    expect(response.status).toBe(429);
    expect(await response.json()).toMatchObject({ fallback: "film" });
    expect(providerCalls.count).toBe(0);
  });
});
