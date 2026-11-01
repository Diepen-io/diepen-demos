import { describe, expect, it } from "vitest";
import { engagementContact } from "./engagement-terms";

describe("the letter's contact line @documents.sign", () => {
  it("names the owner and the role", () => {
    expect(engagementContact({ name: "Sabine Roth", role: "Tax adviser and partner" })).toBe("Sabine Roth, Tax adviser and partner");
  });

  it("leaves out a role that only repeats the name, and starts with a capital", () => {
    expect(engagementContact({ name: "The owner", role: "Owner" })).toBe("The owner");
    expect(engagementContact({ name: "the team", role: "Team" })).toBe("The team");
  });
});
