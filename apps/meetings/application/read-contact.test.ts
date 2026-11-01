import { presets } from "@diepen/voice/presets";
import { describe, expect, it } from "vitest";
import { sellerOf } from "@/domain/seller";
import type { SpeakerTurn } from "@/domain/transcript";
import { readContact } from "./read-contact";

const seller = sellerOf(presets["brickfern-property"]);
const sides = { seller: "Jonas", prospect: "Rosa" };

describe("readContact", () => {
  it("reads the company and email the prospect names", () => {
    const turns: SpeakerTurn[] = [
      { speaker: "Jonas", text: "Hi Rosa, thanks for making the time." },
      { speaker: "Rosa", text: "Sure. The company is called Northgate Homes. Write to rosa@northgate.example please." },
    ];
    expect(readContact(turns, sides, seller)).toMatchObject({
      name: "Rosa",
      company: "Northgate Homes",
      email: "rosa@northgate.example",
    });
  });

  it.each([
    ["a run with no @", "a".repeat(30_000)],
    ["capitalised words with no company suffix", "Big ".repeat(7_500)],
    ["a greeting with no name", `Hi ${"there and ".repeat(2_700)}`],
  ])("stays fast on a 30,000-character turn: %s", (_case, text) => {
    const turns: SpeakerTurn[] = [
      { speaker: "Jonas", text },
      { speaker: "Rosa", text },
    ];
    const started = performance.now();
    readContact(turns, sides, seller);
    expect(performance.now() - started).toBeLessThan(500);
  });
});
