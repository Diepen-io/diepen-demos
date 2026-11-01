import { describe, expect, it } from "vitest";
import { formatSlot, freeSlots } from "./calendar";
import { checkReply } from "./reply-rules";

const free = freeSlots("2026-11-10T21:42", [], 30);
const [firstFree = "", secondFree = "", thirdFree = "", fourthFree = ""] = free;

// The fallback offers the first free slot and the first one on the next day, never two back to back.
const nextDayFree = "2026-11-12T09:00";

function expectFallbackOffer(result: ReturnType<typeof checkReply>) {
  expect(result.status).toBe("booking_offered");
  expect(result.offeredSlots).toEqual([firstFree, nextDayFree]);
  expect(result.bookedSlot).toBeUndefined();
  expect(result.reply).toContain(formatSlot(firstFree));
  expect(result.reply).toContain(formatSlot(nextDayFree));
}

describe("checkReply", () => {
  it("U3: keeps a valid offer", () => {
    const reply = {
      reply: "I can offer Wednesday at 12:30 or 13:00.",
      intent: "Booking",
      status: "booking_offered" as const,
      offeredSlots: [firstFree, secondFree],
    };

    expect(checkReply(reply, free, [])).toEqual(reply);
  });

  it("U3: keeps a valid booking", () => {
    const reply = {
      reply: "You're booked for Wednesday at 12:30.",
      intent: "Booking",
      status: "booked" as const,
      bookedSlot: firstFree,
    };

    expect(checkReply(reply, free, [firstFree, secondFree])).toEqual(reply);
  });

  it("U3: turns a booked slot that is not free into a new offer of two spread free slots", () => {
    const busy = "2026-11-11T08:00";
    const reply = { reply: "Booked for 08:00.", intent: "Booking", status: "booked" as const, bookedSlot: busy };

    expectFallbackOffer(checkReply(reply, free, [busy]));
  });

  it("U3: turns a booked slot that was not offered into a new offer of two spread free slots", () => {
    const reply = { reply: "Booked for 16:00.", intent: "Booking", status: "booked" as const, bookedSlot: thirdFree };

    expectFallbackOffer(checkReply(reply, free, [firstFree, secondFree]));
  });

  it("U3: turns an offer of a slot that is not free into a new offer of two spread free slots", () => {
    const reply = {
      reply: "I can offer 08:00 or 12:30.",
      intent: "Booking",
      status: "booking_offered" as const,
      offeredSlots: ["2026-11-11T08:00", firstFree],
    };

    expectFallbackOffer(checkReply(reply, free, []));
  });

  it("U3: cuts an offer to at most three slots", () => {
    const reply = {
      reply: "Four times are free.",
      intent: "Booking",
      status: "booking_offered" as const,
      offeredSlots: [firstFree, secondFree, thirdFree, fourthFree],
    };

    const result = checkReply(reply, free, []);

    expect(result.status).toBe("booking_offered");
    expect(result.offeredSlots).toEqual([firstFree, secondFree, thirdFree]);
  });
});
