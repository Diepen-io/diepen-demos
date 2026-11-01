import { describe, expect, it } from "vitest";
import { firstName, isPersonName, speakerLabel } from "./person-name";

describe("person names @meetings.make-it-yours", () => {
  it("greets a person by first name and skips a title", () => {
    expect(firstName("Jonas Albers")).toBe("Jonas");
    expect(firstName("Dr. Lena Okafor")).toBe("Lena");
    expect(firstName("Prof Anna Weber")).toBe("Anna");
    expect(firstName("Mrs. Priya Nair")).toBe("Priya");
    expect(firstName("Miss Ada Byrne")).toBe("Ada");
  });

  it("keeps a group name and a bare title whole, as @diepen/voice/person-name does", () => {
    expect(firstName("the team")).toBe("the team");
    expect(firstName("Dr.")).toBe("Dr.");
    expect(firstName("")).toBe("");
  });

  it("tells a person from a group or a role", () => {
    expect(isPersonName("Dr. Lena Okafor")).toBe(true);
    expect(isPersonName("Theo Grant")).toBe(true);
    expect(isPersonName("the team")).toBe(false);
    expect(isPersonName("The Okafor team")).toBe(false);
    expect(isPersonName("Prospect")).toBe(false);
    expect(isPersonName("New contact")).toBe(false);
  });

  it("fits a long name into a speaker label of at most 40 characters at a word break", () => {
    expect(speakerLabel("Harbourline Lettings and Property Services of North London", "You")).toBe("Harbourline Lettings and Property");
    expect(speakerLabel("Becker: Residential", "You")).toBe("Becker Residential");
    expect(speakerLabel("3M Partners", "You")).toBe("You");
  });
});
