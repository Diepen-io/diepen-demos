import { KEYNOTE_MAX_CAPTION_WORDS } from "@diepen/ui/film/keynote-script";
import { presetList } from "@diepen/voice/presets";
import { describe, expect, it } from "vitest";
import { buildInboxKeynote, priyaReplySeconds } from "./inbox-keynote";

describe("inbox keynote film", () => {
  it.each(presetList.map((profile) => [profile.name, profile] as const))(
    "U6: has four beats with short captions and ends on 9 h to 38 s with %s",
    (_name, profile) => {
      const film = buildInboxKeynote(profile);

      expect(film.beats).toHaveLength(4);
      for (const beat of film.beats) {
        expect(beat.caption.trim().split(/\s+/).length, beat.caption).toBeLessThanOrEqual(KEYNOTE_MAX_CAPTION_WORDS);
      }
      expect(film.finale).toMatchObject({ before: "9 h", after: "38 s" });
    },
  );

  it("U6: reads Priya's reply time from the recorded messages and shows it once", () => {
    expect(priyaReplySeconds()).toBe(38);
    const answered = buildInboxKeynote(presetList[0] ?? never()).beats[1];
    expect(answered?.caption).toBe("Answered in 38 seconds.");
    expect(answered?.chip).toBeUndefined();
  });
});

function never(): never {
  throw new Error("No presets");
}
