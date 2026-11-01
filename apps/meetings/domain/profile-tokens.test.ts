import { describe, expect, it } from "vitest";
import { testProfile } from "@/test-support/test-profile";
import { fillTokens, profileTokens } from "./profile-tokens";

// U8, first half. The film half is in film/meetings-keynote.test.tsx.
describe("fillTokens @meetings.make-it-yours", () => {
  it("fills every token of the plan from the profile", () => {
    const text = [
      "{sellerCompany}",
      "{sellerOwner}",
      "{sellerOwnerFirst}",
      "{sellerEmail}",
      "{serviceName}",
      "{servicePrice}",
      "{signOff}",
      "{bookingMinutes}",
    ].join("|");
    expect(fillTokens(text, profileTokens(testProfile))).toBe(
      [
        "Harbourline Lettings",
        "Mara Quist",
        "Mara",
        "hello@harbourline.example",
        "Lettings management",
        "GBP 29 per flat per month",
        "Kind regards,\nMara",
        "45",
      ].join("|"),
    );
  });

  it("fills a token every time it appears", () => {
    expect(fillTokens("{sellerOwnerFirst} and {sellerOwnerFirst}", profileTokens(testProfile))).toBe("Mara and Mara");
  });

  it("throws on an unknown token", () => {
    expect(() => fillTokens("Hi {prospectName}", profileTokens(testProfile))).toThrow();
  });
});
