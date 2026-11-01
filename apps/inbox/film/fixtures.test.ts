import { defaultPresetFor, presetList } from "@diepen/voice/presets";
import { describe, expect, it } from "vitest";
import { fillTemplate } from "@/domain/message-template";
import { averageFirstReplySeconds, averageWaitUntilOpening, countByStatus } from "@/domain/metrics";
import * as fixtures from "./fixtures";
import { filmConversations } from "./fixtures";

/** Every string the fixtures module exports, at any depth, so no text escapes the checks. */
function stringsIn(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(stringsIn);
  if (value && typeof value === "object") return Object.values(value).flatMap(stringsIn);
  return [];
}

const fixtureTexts = stringsIn({ ...fixtures });

describe("film fixtures", () => {
  it("hold the four conversations of the night", () => {
    expect(filmConversations).toHaveLength(4);
    expect(fixtureTexts.length).toBeGreaterThan(20);
  });

  it("U5: average first reply is 38 seconds", () => {
    expect(averageFirstReplySeconds(filmConversations)).toBe(38);
  });

  it("U5: average wait until the 08:00 opening is 540 minutes", () => {
    expect(averageWaitUntilOpening(filmConversations, "08:00")).toBe(540 * 60);
  });

  it("U5: ends with two bookings, one answer and one handover", () => {
    expect(countByStatus(filmConversations)).toMatchObject({ booked: 2, answered: 1, needs_human: 1 });
  });

  it.each(presetList.map((profile) => [profile.name, profile] as const))(
    "U9: no fixture text keeps a slot or an optional part after filling with %s",
    (_name, profile) => {
      for (const text of fixtureTexts) {
        expect(fillTemplate(text, profile), text).not.toMatch(/[{}[\]]/);
      }
    },
  );

  it("U10: no fixture text names the default preset's company, owner or prices", () => {
    const preset = defaultPresetFor("inbox");
    const forbidden = [
      preset.name,
      preset.people.owner.name,
      ...preset.knowledge.services.flatMap((service) => (service.price ? [service.price] : [])),
    ];

    for (const text of fixtureTexts) {
      for (const literal of forbidden) {
        expect(text, `fixture text holds "${literal}"`).not.toContain(literal);
      }
    }
  });

  it("U16: every customer email address ends in @example.com", () => {
    const emails = fixtureTexts.flatMap((text) => text.match(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g) ?? []);

    expect(emails.length).toBeGreaterThan(0);
    for (const email of emails) expect(email).toMatch(/@example\.com$/);
  });

  it("U16: every phone number is in the 07700 900 range for fiction", () => {
    const phones = fixtureTexts.flatMap((text) => text.match(/\+?\d[\d ]{8,}\d/g) ?? []);

    expect(phones.length).toBeGreaterThan(0);
    for (const phone of phones) expect(phone).toMatch(/^07700 900/);
  });
});
