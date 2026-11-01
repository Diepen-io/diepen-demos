import { keynoteDurationMs } from "@diepen/ui/film/keynote-script";
import { presets } from "@diepen/voice/presets";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { buildDocumentsKeynote } from "./documents-keynote";

const profile = presets["ledgerwick-accounting"];
const film = buildDocumentsKeynote(profile);

describe("the documents keynote film @documents.film", () => {
  it("tells four beats and a finale, one beat length each", () => {
    expect(film.beats.map((beat) => beat.id)).toEqual(["uploads", "checked", "problem", "reminder"]);
    expect(keynoteDurationMs(film)).toBe(5 * 3200);
  });

  it("shows the six requested documents first and flags the missing signature", () => {
    const [uploads, , problem] = film.beats;
    expect(renderToStaticMarkup(uploads?.element).match(/<li/g)).toHaveLength(6);
    expect(renderToStaticMarkup(problem?.element)).toContain("Home office form");
    expect(problem?.chip).toEqual({ label: "Signature missing", tone: "fail" });
    expect(film.beats.filter((beat) => beat.chip)).toHaveLength(1);
  });

  it("names the firm in the reminder and in the finale note", () => {
    expect(renderToStaticMarkup(film.beats[3]?.element)).toContain(`${profile.name.replaceAll("&", "&amp;")} · Email`);
    expect(film.finale).toMatchObject({ before: "12 h", after: "1 h" });
    expect(film.finale.note).toContain(profile.name);
    expect(film.finale.note).toContain("fictional");
    expect(film.finale.note).not.toMatch(/[–—]/);
  });
});
