import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { DriveFolder } from "./drive-folder";

afterEach(cleanup);

const path = ["My Drive", "Ledgerwick Accounting", "Clients", "2025 Tax return"];

describe("DriveFolder", () => {
  it("shows every parent folder and the open folder on its own line", () => {
    render(<DriveFolder path={path} />);
    const nav = screen.getByRole("navigation", { name: "Folder path" });
    expect(nav.querySelectorAll("ol > li")).toHaveLength(3);
    expect(nav.textContent).toContain("Ledgerwick Accounting");
    expect(screen.getByText("2025 Tax return").getAttribute("aria-current")).toBe("page");
  });

  it("counts one file in the singular", () => {
    render(<DriveFolder path={path} files={[{ id: "a", name: "a.pdf", modified: "12:42" }]} />);
    expect(screen.getByText("1 file")).toBeTruthy();
  });

  it("lets a wrapped name break only after an underscore or a hyphen", () => {
    const name = "2025_Okafor-Daniel_Payslip-summary.pdf";
    render(<DriveFolder path={path} files={[{ id: "a", name, modified: "12:42" }]} wrapNames />);
    const shown = screen.getByText(name);
    expect(shown.querySelectorAll("wbr")).toHaveLength(2);
    expect(shown.innerHTML).toBe("2025_<wbr>Okafor-Daniel_<wbr>Payslip-summary.pdf");
  });
});
