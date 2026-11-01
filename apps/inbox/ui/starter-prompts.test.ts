import { defaultPresetFor, presets } from "@diepen/voice/presets";
import { describe, expect, it } from "vitest";
import { starterPrompts } from "./starter-prompts";

const preset = defaultPresetFor("inbox");

describe("starterPrompts", () => {
  it("asks about the first service by name", () => {
    expect(starterPrompts(preset)[0]).toBe("What does your check-up and consultation cost?");
    expect(starterPrompts(presets["brickfern-property"])[0]).toBe("What does your full rental management cost?");
  });

  it("asks about prices in general when the profile lists no services", () => {
    const bare = { ...preset, knowledge: { ...preset.knowledge, services: [] } };

    expect(starterPrompts(bare)[0]).toBe("What are your prices?");
  });
});
