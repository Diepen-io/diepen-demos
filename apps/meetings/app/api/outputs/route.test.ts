import { AiUnavailableError } from "@diepen/ai/errors";
import { createGuards, type Guards } from "@diepen/ai/guards";
import type { AiProvider } from "@diepen/ai/provider";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { processCall } from "@/application/process-call";
import { createMockProvider } from "@/test-support/mock-provider";
import { filledSampleCall } from "@/test-support/sample-call";
import { meetingsPreset, testProfile } from "@/test-support/test-profile";
import { POST } from "./route";

type TestContainer = {
  provider: AiProvider;
  providerName: AiProvider["name"];
  guards: Guards;
  processCall: (input: Parameters<typeof processCall>[0]) => ReturnType<typeof processCall>;
};

// The route gets everything from the container, so each test swaps the container's parts.
const state = vi.hoisted(() => ({ container: null as TestContainer | null }));

vi.mock("@/infrastructure/container", () => {
  const current = (): TestContainer => {
    if (!state.container) throw new Error("The test did not set a container");
    return state.container;
  };
  const container = {
    get provider() {
      return current().provider;
    },
    get providerName() {
      return current().providerName;
    },
    get guards() {
      return current().guards;
    },
    get processCall() {
      return current().processCall;
    },
  };
  return { container };
});

function useContainer({ provider = createMockProvider(), guards = createGuards() }: { provider?: AiProvider; guards?: Guards } = {}) {
  state.container = {
    provider,
    providerName: provider.name,
    guards,
    processCall: (input) => processCall(input, { ai: provider }),
  };
}

const localNow = "2026-11-10T14:32:10";

function post(body: unknown): Promise<Response> {
  const raw = typeof body === "string" ? body : JSON.stringify(body);
  return POST(
    new Request("http://localhost/api/outputs", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.7" },
      body: raw,
    }),
  );
}

type BadRequestBody = { error: string; issues: { path: string; message: string }[] };

async function expectTranscriptIssue(response: Response) {
  expect(response.status).toBe(400);
  const body = (await response.json()) as BadRequestBody;
  expect(body.error).toBe("invalid_request");
  expect(body.issues.map((issue) => issue.path)).toContain("transcript");
}

const sample = () => filledSampleCall(meetingsPreset);

// U11
describe("POST /api/outputs @meetings.live-paste", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useContainer();
  });

  it("answers 400 on transcript for a missing, too short or too long transcript", async () => {
    await expectTranscriptIssue(await post({ localNow }));
    await expectTranscriptIssue(await post({ transcript: "Tom: Hi there.", localNow }));
    await expectTranscriptIssue(await post({ transcript: `Tom: ${"rent ".repeat(7000)}`, localNow }));
  });

  it("carries the plan's message for a transcript under 20 words", async () => {
    const body = (await (await post({ transcript: "Tom: Hi there.", localNow })).json()) as BadRequestBody;
    expect(body.issues).toContainEqual({
      path: "transcript",
      message: "Add a bit more of the call. It needs at least 20 words.",
    });
  });

  it("answers 400 for an invalid profile or localNow", async () => {
    const invalidProfile = await post({ transcript: sample(), localNow, profile: { ...testProfile, name: "" } });
    expect(invalidProfile.status).toBe(400);
    const invalidNow = await post({ transcript: sample(), localNow: "next Tuesday" });
    expect(invalidNow.status).toBe(400);
    expect(((await invalidNow.json()) as BadRequestBody).error).toBe("invalid_request");
  });

  it("answers 413 for a body over 100 KB, before reading it as JSON", async () => {
    const response = await post(`{"transcript":"${"a".repeat(101 * 1024)}`);
    expect(response.status).toBe(413);
    expect(await response.json()).toEqual({ error: "too_large" });
  });

  it("answers 413 for a streamed body that declares no length and passes 100 KB", async () => {
    const chunk = new TextEncoder().encode("a".repeat(16 * 1024));
    let sent = 0;
    const endless = new ReadableStream<Uint8Array>({
      pull(controller) {
        sent += 1;
        controller.enqueue(chunk);
      },
    });
    const request = new Request("http://localhost/api/outputs", { method: "POST", body: endless, duplex: "half" } as RequestInit);
    const response = await POST(request);
    expect(response.status).toBe(413);
    expect(await response.json()).toEqual({ error: "too_large" });
    expect(sent).toBeLessThan(10);
  });

  it("answers 429 with the film fallback when a guard trips", async () => {
    useContainer({ guards: createGuards({ dailyCap: 0 }) });
    const response = await post({ transcript: sample(), localNow });
    expect(response.status).toBe(429);
    expect(await response.json()).toMatchObject({ fallback: "film" });
  });

  it("answers 503 unavailable when the provider throws, so the visitor can try again", async () => {
    const failing: AiProvider = {
      name: "claude",
      streamText: () => {
        throw new AiUnavailableError("server", "Claude is down");
      },
      generateText: () => Promise.reject(new AiUnavailableError("server", "Claude is down")),
      generateObject: () => Promise.reject(new AiUnavailableError("server", "Claude is down")),
    };
    useContainer({ provider: failing });
    vi.spyOn(console, "error").mockImplementation(() => {});
    const response = await post({ transcript: sample(), localNow });
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ reason: "unavailable" });
  });

  it("answers 200 with the outputs and the mock provider for the sample call", async () => {
    const response = await post({ transcript: sample(), localNow });
    expect(response.status).toBe(200);
    const body = (await response.json()) as { outputs: { crm: { contactName: string } }; provider: string };
    expect(body.provider).toBe("mock");
    expect(body.outputs.crm.contactName).toBe("Tom Becker");
  });

  it("uses the meetings preset when the request has no profile", async () => {
    const body = (await (await post({ transcript: sample(), localNow })).json()) as { outputs: { proposal: { price: string } } };
    expect(body.outputs.proposal.price).toBe("EUR 34 per unit per month");
  });
});
