import { describe, expect, it } from "vitest";
import { acceptsReplies, applyReply } from "./conversation-status";

const statuses = ["answered", "booking_offered", "booked", "needs_human"] as const;

describe("applyReply", () => {
  it("U4: moves answered to booking_offered to booked", () => {
    const offered = applyReply("answered", "booking_offered");
    expect(offered).toBe("booking_offered");
    expect(applyReply(offered, "booked")).toBe("booked");
  });

  it("U4: never moves a status backwards", () => {
    expect(applyReply("booked", "answered")).toBe("booked");
    expect(applyReply("booking_offered", "answered")).toBe("booking_offered");
  });

  it("U4: keeps needs_human for every later reply", () => {
    expect(applyReply("booked", "needs_human")).toBe("needs_human");
    for (const next of statuses) {
      expect(applyReply("needs_human", next)).toBe("needs_human");
    }
  });
});

describe("acceptsReplies", () => {
  it("U4: is false once a person owns the conversation", () => {
    expect(acceptsReplies("needs_human")).toBe(false);
  });

  it("U4: is true for every other status", () => {
    expect(acceptsReplies("answered")).toBe(true);
    expect(acceptsReplies("booking_offered")).toBe(true);
    expect(acceptsReplies("booked")).toBe(true);
  });
});
