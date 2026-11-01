import { describe, expect, it } from "vitest";
import { pathWithBrand, shareLink } from "./brand-link";

describe("shareLink", () => {
  it("sets the brand and drops film time, the fallback note and record mode", () => {
    const link = shareLink("https://demo.example/live?t=4000&fallback=limit&record=1&brand=old&ref=call", "ottervale-dental");
    expect(link).toBe("https://demo.example/live?ref=call&brand=ottervale-dental");
  });

  it("points at another path when one is given", () => {
    expect(shareLink("https://demo.example/?t=80000", "abc", "/live")).toBe("https://demo.example/live?brand=abc");
  });
});

describe("pathWithBrand", () => {
  it("adds the brand only when there is one", () => {
    expect(pathWithBrand("/live", "brickfern-property")).toBe("/live?brand=brickfern-property");
    expect(pathWithBrand("/live", null)).toBe("/live");
  });
});
