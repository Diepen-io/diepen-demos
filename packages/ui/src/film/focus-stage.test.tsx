import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { highlightProps } from "./film-highlight";
import { defineFocusFilm } from "./focus-script";
import { FocusStage } from "./focus-stage";

const script = defineFocusFilm({
  id: "test",
  title: "Test film",
  durationMs: 20_000,
  parties: [
    { id: "maya", label: "Maya", role: "Email" },
    { id: "calendar", label: "Calendar", role: "Bookings" },
    { id: "owner", label: "Owner", role: "Owner", brand: true },
  ],
  clock: [{ at: 0, time: "2026-03-03T21:47" }],
  beats: [
    { id: "ask", at: 0, focus: "maya", caption: "Maya writes at night", touches: ["owner"], data: { text: "Open?" } },
    { id: "book", at: 5000, focus: "calendar", partner: "maya", caption: "Booked for Thursday", highlight: "booking", data: { text: "Thu 09:00" } },
  ],
  end: { at: 15_000, metric: "Reply time", before: "9 hours", after: "38 seconds" },
});

function openAt(t: number) {
  window.history.replaceState(null, "", `/?t=${t}`);
  render(
    <FocusStage
      script={script}
      renderPanel={(ctx) => (
        <p {...highlightProps(ctx, ctx.party.id === "calendar" ? "booking" : "message")}>
          {ctx.role}: {ctx.beat.data.text}
        </p>
      )}
    />,
  );
}

beforeEach(() => {
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: false, media: query, addEventListener: () => {}, removeEventListener: () => {} }));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("FocusStage", () => {
  it("shows the focus and its partner, the caption, and rings the highlight", () => {
    openAt(6000);

    const panels = document.querySelectorAll("[data-film-panel]");
    expect([...panels].map((panel) => [panel.getAttribute("data-film-panel"), panel.getAttribute("data-role")])).toEqual([
      ["calendar", "focus"],
      ["maya", "partner"],
    ]);
    expect(screen.getByText("Booked for Thursday")).toBeTruthy();
    expect(screen.getByText("focus: Thu 09:00").hasAttribute("data-highlighted")).toBe(true);
    expect(screen.getByText("partner: Thu 09:00").hasAttribute("data-highlighted")).toBe(false);
  });

  it("keeps every party as a chip and marks news off screen", () => {
    openAt(1000);

    const chips = screen.getByRole("list", { name: "Parties" }).querySelectorAll("li");
    expect([...chips].map((chip) => chip.getAttribute("data-party-chip"))).toEqual(["maya", "calendar", "owner"]);
    expect(screen.getByText(", something new").closest("li")?.getAttribute("data-party-chip")).toBe("owner");
    expect(document.querySelectorAll("[data-film-panel]")).toHaveLength(1);
  });
});
