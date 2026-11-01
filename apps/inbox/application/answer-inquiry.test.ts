import type { AiProvider, ObjectRequest } from "@diepen/ai/provider";
import { defaultPresetFor } from "@diepen/voice/presets";
import { describe, expect, it } from "vitest";
import { freeSlots } from "@/domain/calendar";
import { answerInquiry } from "./answer-inquiry";

const profile = defaultPresetFor("inbox");
const now = "2026-11-10T21:42";
const free = freeSlots(now, [], profile.knowledge.bookingMinutes);

type Turn = { role: "customer" | "assistant"; text: string };

function inquiry(messages: Turn[], offeredSlots: string[] = []) {
  return { channel: "chat" as const, profile, messages, bookings: [], offeredSlots, now };
}

/**
 * Answers the way the mock provider of @diepen/ai does: with the request's own `mock`, checked
 * against the schema. Written out here because application code may import only the provider port.
 */
function mockLikeProvider(): AiProvider & { requests: ObjectRequest<unknown>[] } {
  const requests: ObjectRequest<unknown>[] = [];
  return {
    name: "mock",
    requests,
    streamText: () => {
      throw new Error("answerInquiry makes one structured call, never a stream");
    },
    generateText: () => Promise.reject(new Error("answerInquiry makes one structured call")),
    generateObject: <T>(request: ObjectRequest<T>) => {
      requests.push(request);
      return Promise.resolve(request.schema.parse(request.mock()));
    },
  };
}

/** Returns one fixed structured reply, whatever the request asks. */
function stubProvider(answer: unknown): AiProvider {
  return {
    name: "claude",
    streamText: () => {
      throw new Error("not used");
    },
    generateText: () => Promise.reject(new Error("not used")),
    generateObject: <T>(request: ObjectRequest<T>) => Promise.resolve(request.schema.parse(answer)),
  };
}

describe("answerInquiry with the mock provider", () => {
  it("U11: answers a price question with the first service's price", async () => {
    const { reply, replyMs } = await answerInquiry({ ai: mockLikeProvider() }, inquiry([{ role: "customer", text: "How much is it?" }]));

    expect(reply.status).toBe("answered");
    expect(reply.reply).toContain(profile.knowledge.services[0]?.price ?? "missing price");
    expect(replyMs).toBeGreaterThanOrEqual(0);
  });

  it("U11: offers the first two free slots for a booking request", async () => {
    const { reply } = await answerInquiry({ ai: mockLikeProvider() }, inquiry([{ role: "customer", text: "Can I book?" }]));

    expect(reply.status).toBe("booking_offered");
    expect(reply.offeredSlots).toEqual(free.slice(0, 2));
  });

  it("U11: books the offered slot whose time the customer names", async () => {
    const offered = ["2026-11-12T09:00", "2026-11-12T10:30"];
    const messages: Turn[] = [
      { role: "customer", text: "Can I book a check-up on Thursday?" },
      { role: "assistant", text: "I can offer Thursday 12 November at 09:00 or Thursday 12 November at 10:30." },
      { role: "customer", text: "09:00 please!" },
    ];

    const { reply } = await answerInquiry({ ai: mockLikeProvider() }, inquiry(messages, offered));

    expect(reply.status).toBe("booked");
    expect(reply.bookedSlot).toBe("2026-11-12T09:00");
  });

  it("U11: hands a refund request to a person with the profile's handover message", async () => {
    const { reply } = await answerInquiry({ ai: mockLikeProvider() }, inquiry([{ role: "customer", text: "I want a refund" }]));

    expect(reply.status).toBe("needs_human");
    expect(reply.handoverReason).toBeTruthy();
    expect(reply.reply).toContain(profile.policies.handoverMessage);
  });
});

describe("answerInquiry and the provider", () => {
  it("U12: calls the provider once, as chat, with the company in the system prompt and at most 20 messages", async () => {
    const provider = mockLikeProvider();
    const messages: Turn[] = Array.from({ length: 20 }, (_, index) => ({
      role: index % 2 === 0 ? "assistant" : "customer",
      text: `Message ${index + 1}`,
    }));

    await answerInquiry({ ai: provider }, inquiry(messages));

    expect(provider.requests).toHaveLength(1);
    const [request] = provider.requests;
    expect(request?.role).toBe("chat");
    expect(request?.system).toContain(profile.name);
    expect(request?.messages.length).toBeGreaterThan(0);
    expect(request?.messages.length).toBeLessThanOrEqual(20);
  });

  it("U12: turns a booking of a slot that is not free into a new offer", async () => {
    const busy = "2026-11-11T08:00";
    const provider = stubProvider({ reply: "Booked for 08:00.", intent: "Booking", status: "booked", bookedSlot: busy });
    const messages: Turn[] = [
      { role: "assistant", text: "I can offer Wednesday at 08:00." },
      { role: "customer", text: "08:00 works." },
    ];

    const { reply } = await answerInquiry({ ai: provider }, inquiry(messages, [busy]));

    expect(reply.status).toBe("booking_offered");
    expect(reply.bookedSlot).toBeUndefined();
    expect(reply.offeredSlots).toEqual(free.slice(0, 2));
  });
});
