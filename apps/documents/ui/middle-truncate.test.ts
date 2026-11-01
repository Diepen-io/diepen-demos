import { describe, expect, it } from "vitest";
import { wrappableFileName } from "./drive-lane";
import { keptTail } from "./middle-truncate";

describe("file names in narrow places @documents.own-file", () => {
  it("keeps a short name whole", () => {
    expect(keptTail("my-file.pdf")).toBe("");
  });

  it("keeps the last word of a long name whole", () => {
    expect(keptTail("home-office-confirmation-2025-unsigned.pdf")).toBe("unsigned.pdf");
  });

  it("keeps only the extension when the last word is too long to keep", () => {
    expect(keptTail("scanned-documentfromthebankbranch2025.pdf")).toBe(".pdf");
    expect(keptTail("scanneddocumentfromthebankbranch.pdf")).toBe(".pdf");
  });

  it("lets a Drive name wrap after an underscore", () => {
    expect(wrappableFileName("2025_Okafor-Daniel_Payslip-summary.pdf")).toBe("2025_​Okafor-Daniel_​Payslip-summary.pdf");
  });
});
