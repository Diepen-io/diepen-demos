import { isComplete } from "@/domain/checklist";
import { driveListing } from "@/test-support/live-sessions";
import { defineFilmScript } from "@diepen/ui/film/film-script";
import { presets } from "@diepen/voice/presets";
import { describe, expect, it } from "vitest";
import { documentsFilm } from "./documents-film";
import { foldBeats } from "./film-state";

const profile = presets["ledgerwick-accounting"];
const script = documentsFilm(profile);

describe("the documents film @documents.film", () => {
  it("passes defineFilmScript", () => {
    expect(() => defineFilmScript(script)).not.toThrow();
    expect(script.beats).toHaveLength(40);
    expect(script.lanes.map((lane) => lane.id)).toEqual(["firm", "client", "system", "drive"]);
  });

  it("runs between 60 and 90 seconds", () => {
    expect(script.durationMs).toBeGreaterThanOrEqual(60_000);
    expect(script.durationMs).toBeLessThanOrEqual(90_000);
  });

  it("keeps every caption at or under 80 characters with the default preset", () => {
    for (const beat of script.beats) {
      if (beat.caption) expect(beat.caption.length, beat.caption).toBeLessThanOrEqual(80);
    }
  });

  it("fills the firm and the owner from the profile", () => {
    const text = JSON.stringify(script);
    expect(text).not.toContain("{firm}");
    expect(text).not.toContain("{owner}");
    expect(script.beats[0]?.caption).toContain(profile.name);
    const other = documentsFilm(presets["brickfern-property"]);
    expect(other.beats[0]?.caption).toContain("Brickfern Property Management");
    expect(JSON.stringify(other)).not.toContain(profile.name);
  });

  it("has no em or en dash anywhere", () => {
    expect(JSON.stringify(script)).not.toMatch(/[–—]/);
  });

  it("ends with 6 of 6 checked and the Drive tree of the script", () => {
    const state = foldBeats(script.beats);
    expect(isComplete(state.checklist)).toBe(true);
    expect(state.checklist.filter((item) => item.state === "checked")).toHaveLength(6);
    expect(driveListing(state.drive)).toEqual([
      ["01 Engagement", ["2025_Okafor-Daniel_Engagement-letter_signed.pdf"]],
      ["02 Income", ["2025_Okafor-Daniel_Payslip-summary.pdf"]],
      ["03 Bank", ["2025_Okafor-Daniel_Bank-interest-statement.pdf"]],
      ["04 Deductions", ["2025_Okafor-Daniel_Donation-receipt.pdf", "2025_Okafor-Daniel_Home-office-confirmation.pdf"]],
      ["05 Insurance", ["2025_Okafor-Daniel_Health-insurance-statement.png"]],
      [
        "99 Replaced",
        [
          "2024_Okafor-Daniel_Bank-interest-statement_wrong-year.pdf",
          "2025_Okafor-Daniel_Home-office-confirmation_missing-signature.pdf",
        ],
      ],
    ]);
  });

  it("shows the bank statement as a problem once beat 19 has landed", () => {
    const landed = script.beats.filter((beat) => beat.at <= 26_300);
    const bank = foldBeats(landed).checklist.find((item) => item.id === "bank-interest");
    expect(bank?.state).toBe("problem");
  });
});
