import { describe, expect, it } from "vitest";
import { frameAt } from "./film-state";

const minutes = 30;

describe("frameAt", () => {
  it("U8: at 08:00 the owner view lists the four conversations, needs a human first", () => {
    const frame = frameAt("2026-11-11T08:00:00", minutes);

    expect(frame.ownerRows.map(({ channel, name, status }) => ({ channel, name, status }))).toEqual([
      { channel: "chat", name: "Daniel Moore", status: "needs_human" },
      { channel: "linkedin", name: "Tom Becker", status: "booked" },
      { channel: "instagram", name: "Priya Shah", status: "answered" },
      { channel: "email", name: "Ana Ruiz", status: "booked" },
    ]);
  });

  it("U8: at 21:45:16 Ana's booking is in the calendar, her 09:00 is picked, and Tom has not written yet", () => {
    const frame = frameAt("2026-11-10T21:45:16", minutes);

    expect(frame.bookings).toEqual([expect.objectContaining({ ref: "C1", kind: "booked", start: "2026-11-12T09:00", end: "2026-11-12T09:30" })]);
    expect(frame.threads.C1.messages.find((message) => message.id === "C1-4")?.slots).toEqual([
      { iso: "2026-11-12T09:00", picked: true },
      { iso: "2026-11-12T10:30", picked: false },
    ]);
    expect(frame.threads.C3.messages).toEqual([]);
    expect(frame.ownerRows.map((row) => row.name)).toEqual(["Ana Ruiz"]);
  });

  it("U8: an open offer shows as two offered blocks until the customer picks", () => {
    const frame = frameAt("2026-11-10T21:44:31", minutes);

    expect(frame.bookings.map(({ kind, start }) => ({ kind, start }))).toEqual([
      { kind: "offered", start: "2026-11-12T09:00" },
      { kind: "offered", start: "2026-11-12T10:30" },
    ]);
  });

  it("U8: Priya's first reply took 38 seconds", () => {
    expect(frameAt("2026-11-10T22:14:38", minutes).threads.C2.firstReplySeconds).toBe(38);
  });
});
