import { defaultPresetFor } from "@diepen/voice/presets";
import { describe, expect, it } from "vitest";
import { snapshotAt } from "./film-state";

const profile = defaultPresetFor("inbox");

describe("snapshotAt", () => {
  it("U8: at 66000 ms the owner view lists the four conversations, needs a human first", () => {
    const snapshot = snapshotAt(66_000, profile);

    expect(snapshot.conversations).toHaveLength(4);
    expect(snapshot.ownerRows.map(({ channel, name, status }) => ({ channel, name, status }))).toEqual([
      { channel: "chat", name: "Daniel Moore", status: "needs_human" },
      { channel: "linkedin", name: "Tom Becker", status: "booked" },
      { channel: "instagram", name: "Priya Shah", status: "answered" },
      { channel: "email", name: "Ana Ruiz", status: "booked" },
    ]);
  });

  it("U8: at 20500 ms Ana's booking is in the calendar and Tom has not written yet", () => {
    const snapshot = snapshotAt(20_500, profile);

    expect(snapshot.calendarBlocks).toContainEqual(
      expect.objectContaining({ kind: "booked", start: "2026-11-12T09:00" }),
    );
    expect(snapshot.ownerRows.map((row) => row.name)).not.toContain("Tom Becker");
    expect(snapshot.conversations).toHaveLength(1);
  });
});
