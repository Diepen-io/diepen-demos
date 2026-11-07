import { describe, expect, it } from "vitest";
import { channelForRefund, channelForTime, inboxGuide } from "./live-guide";
import { initialLiveState, type LiveState, type LiveThread } from "./live-inbox-state";

const names = { company: "Ottervale Dental", assistant: "Mia", owner: "Dr. Lena Okafor" };

function withThread(state: LiveState, channel: keyof LiveState["threads"], thread: Partial<LiveThread>): LiveState {
  return { ...state, threads: { ...state.threads, [channel]: { ...state.threads[channel], ...thread } } };
}

const asked: Partial<LiveThread> = { messages: [{ id: "m1", role: "customer", text: "Can I book a time this week?", at: "2026-11-07T10:00" }] };

describe("the live guide's next step @inbox.guide", () => {
  it("asks for a time first, then points at the times on offer", () => {
    const start = initialLiveState();
    expect(inboxGuide(start, names)).toMatchObject({ number: 1, action: "ask-time" });
    expect(inboxGuide(withThread(start, "email", { ...asked, sending: true }), names)).toMatchObject({ waiting: true });
    const offered = withThread(start, "email", { ...asked, status: "booking_offered", offeredSlots: ["2026-11-09T12:30"] });
    expect(inboxGuide(offered, names)).toMatchObject({ number: 2, spotlightSlots: true });
  });

  it("asks for a refund after the booking and ends after the handover", () => {
    const booked = { ...withThread(initialLiveState(), "email", { ...asked, status: "booked" as const }), bookings: [{ slot: "2026-11-09T12:30", channel: "email" as const, isCall: false }] };
    expect(inboxGuide(booked, names)).toMatchObject({ number: 3, action: "ask-refund" });
    expect(channelForRefund(booked)).toBe("instagram");
    const handedOver = withThread(booked, "instagram", { ...asked, status: "needs_human" });
    expect(inboxGuide(handedOver, names)).toMatchObject({ action: "end" });
    expect(inboxGuide(handedOver, names).number).toBeUndefined();
  });

  it("asks for a time on a channel that still takes messages", () => {
    const handedOver = withThread(initialLiveState(), "email", { ...asked, status: "needs_human" });
    expect(inboxGuide(handedOver, names)).toMatchObject({ action: "ask-time" });
    expect(channelForTime(handedOver)).toBe("instagram");
  });
});
