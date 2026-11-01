import { describe, expect, it } from "vitest";
import { defaultPresetFor, presetList, presets } from "./presets.ts";
import { companyProfileSchema } from "./profile.ts";

describe("presets", () => {
  it.each(presetList.map((p) => [p.id, p] as const))("%s parses with the profile schema", (_id, preset) => {
    expect(companyProfileSchema.parse(preset)).toEqual(preset);
  });

  it("are all fictional, in different industries, with .example addresses", () => {
    expect(presetList).toHaveLength(3);
    expect(new Set(presetList.map((p) => p.industry)).size).toBe(3);
    for (const preset of presetList) {
      expect(preset.fictional).toBe(true);
      expect(preset.website).toMatch(/^https:\/\/[a-z-]+\.example$/);
      expect(preset.knowledge.contactEmail).toMatch(/@[a-z-]+\.example$/);
      // Ofcom keeps 07700 900000 to 900999 for drama, so no real person gets called.
      expect(preset.knowledge.phone).toMatch(/^\+44 7700 900\d{3}$/);
    }
  });

  it("are keyed by their own id", () => {
    for (const [id, preset] of Object.entries(presets)) expect(preset.id).toBe(id);
  });

  it("give every service a price and 6 to 8 FAQ entries", () => {
    for (const preset of presetList) {
      expect(preset.knowledge.services.every((s) => s.price)).toBe(true);
      expect(preset.knowledge.faq.length).toBeGreaterThanOrEqual(6);
      expect(preset.knowledge.faq.length).toBeLessThanOrEqual(8);
    }
  });

  it("pick the default company for each demo", () => {
    expect(defaultPresetFor("inbox").industry).toBe("Dental clinic");
    expect(defaultPresetFor("documents").industry).toBe("Tax and accounting firm");
    expect(defaultPresetFor("meetings").industry).toBe("Residential property management");
  });

  it("lead the meetings preset with the full management service, which the film and proposal price", () => {
    const meetings = defaultPresetFor("meetings");
    expect(meetings.knowledge.services.find((s) => s.price)?.name).toBe("Full rental management");
    expect(meetings.people.owner.name).toBeTruthy();
    expect(meetings.knowledge.bookingMinutes).toBeGreaterThan(0);
  });

  it("contain no em or en dashes", () => {
    expect(JSON.stringify(presetList)).not.toMatch(/[\u2013\u2014]/);
  });
});
