import { describe, expect, it } from "vitest";
import { capitalised, inSentence, withArticle } from "./plain-words";

describe("names inside a sentence @documents.problem", () => {
  it("lowercases a document type but keeps an acronym", () => {
    expect(inSentence("Donation receipt")).toBe("donation receipt");
    expect(inSentence("PDF scan")).toBe("PDF scan");
  });

  it("picks a or an", () => {
    expect(withArticle("donation receipt")).toBe("a donation receipt");
    expect(withArticle("annual payslip summary 2025")).toBe("an annual payslip summary 2025");
  });

  it("capitalises the first word of a line", () => {
    expect(capitalised("no name or year found")).toBe("No name or year found");
  });
});
