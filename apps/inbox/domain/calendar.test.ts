import { describe, expect, it } from "vitest";
import { formatSlot, formatSlotChip, freeSlots, spreadSlots } from "./calendar";

// The busy pattern of section 3 of docs/features/inbox.md, written out so the test checks the plan.
const busyByDate: Record<string, [string, string][]> = {
  "2026-11-11": [["08:00", "12:30"], ["14:00", "15:30"]],
  "2026-11-12": [["08:00", "09:00"], ["09:30", "10:30"], ["11:00", "13:00"]],
  "2026-11-13": [["08:00", "10:30"], ["12:00", "14:00"]],
};

const minutesOf = (hhmm: string) => {
  const [hours = 0, minutes = 0] = hhmm.split(":").map(Number);
  return hours * 60 + minutes;
};

const dateOf = (slot: string) => slot.slice(0, 10);
const timeOf = (slot: string) => slot.slice(11, 16);

describe("freeSlots", () => {
  it("U1: from Tuesday night, offers only free Wed to Fri slots inside working hours", () => {
    const slots = freeSlots("2026-11-10T21:42", [], 30);

    expect(slots[0]).toBe("2026-11-11T12:30");
    expect(slots).toEqual([
      "2026-11-11T12:30", "2026-11-11T13:00", "2026-11-11T13:30", "2026-11-11T15:30",
      "2026-11-11T16:00", "2026-11-11T16:30", "2026-11-11T17:00", "2026-11-11T17:30",
      "2026-11-12T09:00", "2026-11-12T10:30", "2026-11-12T13:00", "2026-11-12T13:30",
      "2026-11-12T14:00", "2026-11-12T14:30", "2026-11-12T15:00", "2026-11-12T15:30",
      "2026-11-12T16:00", "2026-11-12T16:30", "2026-11-12T17:00", "2026-11-12T17:30",
      "2026-11-13T10:30", "2026-11-13T11:00", "2026-11-13T11:30",
    ]);

    for (const slot of slots) {
      const date = dateOf(slot);
      const start = minutesOf(timeOf(slot));
      const end = start + 30;
      expect(Object.keys(busyByDate)).toContain(date);
      expect(start).toBeGreaterThanOrEqual(minutesOf("08:00"));
      expect(end).toBeLessThanOrEqual(minutesOf(date === "2026-11-13" ? "14:00" : "18:00"));
      for (const [from, to] of busyByDate[date] ?? []) {
        const overlaps = start < minutesOf(to) && end > minutesOf(from);
        expect(overlaps, `${slot} overlaps busy ${from} to ${to}`).toBe(false);
      }
    }
  });

  it("U2: from Friday evening, starts on Monday with Wednesday's busy pattern", () => {
    const slots = freeSlots("2026-11-13T18:30", [], 30);

    expect(slots[0]).toBe("2026-11-16T12:30");
    expect(new Set(slots.map(dateOf))).toEqual(new Set(["2026-11-16", "2026-11-17", "2026-11-18"]));
  });

  it("U2: a booked slot is no longer free", () => {
    const slots = freeSlots("2026-11-13T18:30", ["2026-11-16T12:30"], 30);

    expect(slots).not.toContain("2026-11-16T12:30");
    expect(slots[0]).toBe("2026-11-16T13:00");
  });
});

describe("spreadSlots", () => {
  it("U3: offers the first free slot and the first one on a later day, never two back to back", () => {
    expect(spreadSlots(freeSlots("2026-11-10T21:42", [], 30))).toEqual(["2026-11-11T12:30", "2026-11-12T09:00"]);
  });

  it("U3: on the last free day, keeps at least two hours between the two times", () => {
    expect(spreadSlots(["2026-11-13T10:30", "2026-11-13T11:00", "2026-11-13T11:30", "2026-11-13T12:30"])).toEqual([
      "2026-11-13T10:30",
      "2026-11-13T12:30",
    ]);
    expect(spreadSlots(["2026-11-13T10:30", "2026-11-13T11:00"])).toEqual(["2026-11-13T10:30"]);
  });
});

describe("slot labels", () => {
  it("writes a slot the way a reply says it", () => {
    expect(formatSlot("2026-11-12T09:00")).toBe("Thursday 12 November at 09:00");
  });

  it("writes a slot the way a chip shows it", () => {
    expect(formatSlotChip("2026-11-12T09:00")).toBe("Thu 12 Nov, 09:00");
  });
});
