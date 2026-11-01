import { KEYNOTE_MAX_CAPTION_WORDS } from "@diepen/ui/film/keynote-script";
import { presetList } from "@diepen/voice/presets";
import { describe, expect, it } from "vitest";
import { buildInboxKeynote } from "./inbox-keynote";

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
});
