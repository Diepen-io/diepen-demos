import { describe, expect, it } from "vitest";
import { testProfile, unpricedProfile } from "@/test-support/test-profile";
import { proposalService } from "./proposal-service";

// U7. The test profile's first service has no price; its second costs GBP 29 per flat per month.
describe("proposalService @meetings.make-it-yours", () => {
  it("returns the first priced service, verbatim", () => {
    expect(proposalService(testProfile)).toEqual({
      name: "Lettings management",
      description: "Tenant calls, repairs, viewings and a monthly owner statement.",
      price: "GBP 29 per flat per month",
    });
  });

  it("returns Price on request when no service has a price", () => {
    expect(proposalService(unpricedProfile).price).toBe("Price on request");
  });
});
