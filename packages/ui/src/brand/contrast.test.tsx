import { describe, expect, it } from "vitest";
import { contrastGrade, contrastRatio, readableForeground } from "./contrast";

describe("contrastRatio", () => {
  it("gives 21 for black on white and 1 for a colour on itself", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#0f766e", "#0f766e")).toBeCloseTo(1, 5);
  });

  it("does not depend on the order of the colours", () => {
    expect(contrastRatio("#0f766e", "#ffffff")).toBeCloseTo(contrastRatio("#ffffff", "#0f766e") ?? 0, 10);
  });

  it("matches the WCAG value for a known pair", () => {
    expect(contrastRatio("#767676", "#ffffff")).toBeCloseTo(4.54, 2);
  });

  it("returns null for a value that is not a six digit hex colour", () => {
    expect(contrastRatio("teal", "#ffffff")).toBeNull();
    expect(contrastRatio("#fff", "#ffffff")).toBeNull();
  });
});

describe("contrastGrade", () => {
  it("grades at the WCAG thresholds", () => {
    expect(contrastGrade(7)).toBe("AAA");
    expect(contrastGrade(4.5)).toBe("AA");
    expect(contrastGrade(3)).toBe("AA large");
    expect(contrastGrade(2.99)).toBe("Fail");
  });
});

describe("readableForeground", () => {
  it("picks white on dark brands and near black on light ones", () => {
    expect(readableForeground("#0f766e")).toBe("#ffffff");
    expect(readableForeground("#fde047")).toBe("#171717");
  });
});
