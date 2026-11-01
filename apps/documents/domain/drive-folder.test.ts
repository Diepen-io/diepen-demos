import { driveListing } from "@/test-support/live-sessions";
import { describe, expect, it } from "vitest";
import type { ItemId } from "./document-request";
import { createDriveTree, fileIntoDrive, type DriveTree } from "./drive-folder";

function file(tree: DriveTree, itemId: ItemId, fileName: string, status: "ok" | "problem"): DriveTree {
  return fileIntoDrive(tree, { itemId, fileName, status });
}

describe("fileIntoDrive @documents.problem", () => {
  it("puts a passing file in its item's folder", () => {
    const tree = file(createDriveTree(), "payslip-summary", "2025_Okafor-Daniel_Payslip-summary.pdf", "ok");
    expect(driveListing(tree)).toEqual([["02 Income", ["2025_Okafor-Daniel_Payslip-summary.pdf"]]]);
  });

  it("puts a problem file in 00 Needs attention", () => {
    const tree = file(createDriveTree(), "bank-interest", "2024_Okafor-Daniel_Bank-interest-statement_wrong-year.pdf", "problem");
    expect(driveListing(tree)).toEqual([["00 Needs attention", ["2024_Okafor-Daniel_Bank-interest-statement_wrong-year.pdf"]]]);
  });

  it("moves the item's earlier problem files to 99 Replaced when it passes, and leaves other items alone", () => {
    let tree = createDriveTree();
    tree = file(tree, "bank-interest", "2024_Okafor-Daniel_Bank-interest-statement_wrong-year.pdf", "problem");
    tree = file(tree, "home-office", "2025_Okafor-Daniel_Home-office-confirmation_missing-signature.pdf", "problem");
    tree = file(tree, "bank-interest", "2025_Okafor-Amara_Bank-interest-statement_wrong-person.pdf", "problem");
    tree = file(tree, "bank-interest", "2025_Okafor-Daniel_Bank-interest-statement.pdf", "ok");
    expect(driveListing(tree)).toEqual([
      ["00 Needs attention", ["2025_Okafor-Daniel_Home-office-confirmation_missing-signature.pdf"]],
      ["03 Bank", ["2025_Okafor-Daniel_Bank-interest-statement.pdf"]],
      [
        "99 Replaced",
        ["2024_Okafor-Daniel_Bank-interest-statement_wrong-year.pdf", "2025_Okafor-Amara_Bank-interest-statement_wrong-person.pdf"],
      ],
    ]);
  });

  it("adds _2 and then _3 to a name that is already in the folder", () => {
    let tree = createDriveTree();
    for (let copy = 0; copy < 3; copy++) {
      tree = file(tree, "donation-receipt", "2025_Okafor-Daniel_Donation-receipt.pdf", "ok");
    }
    expect(driveListing(tree)).toEqual([
      [
        "04 Deductions",
        [
          "2025_Okafor-Daniel_Donation-receipt.pdf",
          "2025_Okafor-Daniel_Donation-receipt_2.pdf",
          "2025_Okafor-Daniel_Donation-receipt_3.pdf",
        ],
      ],
    ]);
  });

  it("orders folders by their number prefix and files by name", () => {
    let tree = createDriveTree();
    tree = file(tree, "health-insurance", "2025_Okafor-Daniel_Health-insurance-statement.png", "ok");
    tree = file(tree, "home-office", "2025_Okafor-Daniel_Home-office-confirmation.pdf", "ok");
    tree = file(tree, "engagement-letter", "2025_Okafor-Daniel_Engagement-letter_signed.pdf", "ok");
    tree = file(tree, "donation-receipt", "2025_Okafor-Daniel_Donation-receipt.pdf", "ok");
    tree = file(tree, "payslip-summary", "2025_Okafor-Daniel_Payslip-summary_missing-page.pdf", "problem");
    expect(driveListing(tree)).toEqual([
      ["00 Needs attention", ["2025_Okafor-Daniel_Payslip-summary_missing-page.pdf"]],
      ["01 Engagement", ["2025_Okafor-Daniel_Engagement-letter_signed.pdf"]],
      ["04 Deductions", ["2025_Okafor-Daniel_Donation-receipt.pdf", "2025_Okafor-Daniel_Home-office-confirmation.pdf"]],
      ["05 Insurance", ["2025_Okafor-Daniel_Health-insurance-statement.png"]],
    ]);
    const prefixes = tree.folders.map((folder) => Number(folder.name.slice(0, 2)));
    expect(prefixes).toEqual([...prefixes].sort((a, b) => a - b));
  });

  it("returns a new tree and leaves the old one as it was", () => {
    const before = createDriveTree();
    const after = file(before, "payslip-summary", "2025_Okafor-Daniel_Payslip-summary.pdf", "ok");
    expect(driveListing(before)).toEqual([]);
    expect(driveListing(after)).toHaveLength(1);
  });
});
