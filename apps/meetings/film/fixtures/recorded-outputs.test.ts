import { presetList } from "@diepen/voice/presets";
import { describe, expect, it } from "vitest";
import { meetingsOutputsSchema } from "@/test-support/meetings-outputs-schema";
import { fillTokensDeep } from "@/test-support/sample-call";
import { testProfile } from "@/test-support/test-profile";
import { recordedOutputs } from "./recorded-outputs";

// U13, first half
describe("the recorded outputs @meetings.film", () => {
  it.each([...presetList, testProfile].map((profile) => [profile.id, profile] as const))(
    "pass the call-outputs schema once tokens are filled for %s",
    (_id, profile) => {
      const result = meetingsOutputsSchema.safeParse(fillTokensDeep(recordedOutputs, profile));
      expect(result.error?.issues ?? []).toEqual([]);
    },
  );
});
