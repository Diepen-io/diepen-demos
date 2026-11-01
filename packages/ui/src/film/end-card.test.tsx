import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { EndCard, makerLine } from "./end-card";

const end = { at: 0, metric: "Reply time", before: "7 hours", after: "30 seconds", note: "A simulation with a fictional company." };

afterEach(cleanup);

describe("EndCard", () => {
  it("offers Replay and Try it live with the note", () => {
    render(<EndCard end={end} visible onReplay={() => {}} liveHref="/live?brand=x" />);
    expect(screen.getByRole("button", { name: "Replay" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Try it live" }).getAttribute("href")).toBe("/live?brand=x");
    expect(screen.queryByText(makerLine)).toBeNull();
    expect(screen.getByText(end.note)).toBeTruthy();
  });

  it("names the maker instead of the buttons in a recording", () => {
    render(<EndCard end={end} visible recording onReplay={() => {}} liveHref="/live" />);
    expect(screen.getByText("Made by diepen.ai")).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByText(end.note)).toBeTruthy();
  });
});
