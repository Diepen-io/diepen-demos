import type { CompanyProfile } from "@diepen/voice/profile";
import { presetList } from "@diepen/voice/presets";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { BrandProvider } from "../brand/brand-provider";
import { GuideBar, type GuideStep } from "./guide-bar";

const [preset] = presetList as [CompanyProfile];

function renderBar(step: GuideStep) {
  render(
    <BrandProvider defaultProfile={preset}>
      <GuideBar step={step} />
      <button type="button" data-spotlight="outside">
        Target
      </button>
    </BrandProvider>,
  );
}

// jsdom has no layout and no media queries, so it has neither scrollIntoView nor matchMedia.
const scrollIntoView = vi.fn();

beforeAll(() => {
  Element.prototype.scrollIntoView = scrollIntoView;
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: false, media: query, addEventListener: () => {}, removeEventListener: () => {} }));
});
afterEach(cleanup);

describe("GuideBar", () => {
  it("shows the step and one large button that runs the action", () => {
    const onClick = vi.fn();
    renderBar({ id: "skip", number: 2, total: 3, text: "Skip ahead.", action: { label: "Skip 3 days", onClick } });
    expect(screen.getByRole("region", { name: "Next step" }).textContent).toContain("Step 2 of 3");
    fireEvent.click(screen.getByRole("button", { name: "Skip 3 days" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("scrolls the spotlight into view when the step changes", () => {
    renderBar({ id: "open", number: 1, total: 3, text: "Open the email." });
    expect(scrollIntoView).toHaveBeenCalled();
  });

  it("ends with Start over and a link to the film", () => {
    const onStartOver = vi.fn();
    renderBar({ id: "end", total: 3, text: "All done.", onStartOver });
    fireEvent.click(screen.getByRole("button", { name: "Start over" }));
    expect(onStartOver).toHaveBeenCalledOnce();
    expect(screen.getByRole("link", { name: "Watch the film" }).getAttribute("href")).toMatch(/^\/(\?|$)/);
  });
});
