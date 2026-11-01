import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { StatusBadge, statusLooks, type Status } from "./badge";

afterEach(cleanup);

const expected: [Status, string, string][] = [
  ["answered", "Answered", "neutral"],
  ["booking_offered", "Slot offered", "info"],
  ["booked", "Booked", "pass"],
  ["needs_human", "Needs a human", "wait"],
  ["received", "Received", "neutral"],
  ["checked", "Checked", "pass"],
  ["problem", "Problem found", "fail"],
  ["missing", "Missing", "wait"],
];

describe("StatusBadge", () => {
  it.each(expected)("shows %s as %s in the %s tone", (status, label, tone) => {
    expect(statusLooks[status]).toMatchObject({ label, tone });
    render(<StatusBadge status={status} />);
    const badge = screen.getByText(label);
    expect(badge.className).toContain(`text-${tone === "neutral" ? "muted" : tone}`);
  });
});
