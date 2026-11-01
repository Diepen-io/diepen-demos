import type { CompanyProfile } from "@diepen/voice/profile";
import { presetList } from "@diepen/voice/presets";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { BrandProvider } from "../brand/brand-provider";
import { DemoShell } from "./demo-shell";

const [preset] = presetList as [CompanyProfile];

function renderShell(mode: "film" | "live" = "film") {
  render(
    <BrandProvider defaultProfile={preset}>
      <DemoShell title="Inbox autopilot" mode={mode}>
        <p>Demo body</p>
      </DemoShell>
    </BrandProvider>,
  );
}

beforeEach(() => window.history.replaceState(null, "", "/"));
afterEach(cleanup);

describe("DemoShell", () => {
  it("shows the top bar, the fictional footer and the repo link", () => {
    renderShell();
    expect(screen.getByRole("button", { name: "Make it yours" })).toBeTruthy();
    expect(screen.getByText(new RegExp(`${preset.name}, a fictional company`))).toBeTruthy();
    expect(screen.getByRole("link", { name: "Source code on GitHub" }).getAttribute("href")).toBe("https://github.com/Diepen-io/diepen-demos");
  });

  it("hides the top bar and footer with ?record=1", () => {
    window.history.replaceState(null, "", "/?record=1");
    renderShell();
    expect(screen.getByText("Demo body")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Make it yours" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Source code on GitHub" })).toBeNull();
  });

  it("shows the fallback note with ?fallback=limit and removes it on dismiss", () => {
    window.history.replaceState(null, "", "/live?fallback=limit");
    renderShell("live");
    expect(screen.getByRole("link", { name: "Watch the film" }).getAttribute("href")).toBe("/");
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    });
    expect(screen.queryByText(/Live answers are paused/)).toBeNull();
    expect(window.location.search).toBe("");
  });
});
