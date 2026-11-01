import { describe, expect, it } from "vitest";
import { firstName, teamOwner } from "./person-name.ts";

describe("firstName", () => {
  it("skips titles with or without a full stop", () => {
    expect(firstName("Dr. Lena Okafor")).toBe("Lena");
    expect(firstName("Prof Hans Weber")).toBe("Hans");
    expect(firstName("Mrs. Ada Byrne")).toBe("Ada");
    expect(firstName("Ms. Ada Byrne")).toBe("Ada");
    expect(firstName("Mr. Tom Reed")).toBe("Tom");
  });

  it("returns the first word of a plain name", () => {
    expect(firstName("Jonas Albers")).toBe("Jonas");
    expect(firstName("  Mara  ")).toBe("Mara");
  });

  it("keeps a group name such as the team whole", () => {
    expect(firstName(teamOwner.name)).toBe("the team");
    expect(firstName("The Harbour team")).toBe("The Harbour team");
  });

  it("keeps a name that is only a title", () => {
    expect(firstName("Dr.")).toBe("Dr.");
    expect(firstName("")).toBe("");
  });
});
