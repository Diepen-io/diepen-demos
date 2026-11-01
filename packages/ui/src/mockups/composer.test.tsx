import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Composer } from "./composer";

afterEach(cleanup);

describe("Composer", () => {
  it("caps the message and counts down over the last 100 characters", () => {
    render(<Composer channel="chat" onSend={() => undefined} maxLength={1000} />);
    const field = screen.getByRole("textbox", { name: "Message" });
    expect(field).toHaveProperty("maxLength", 1000);

    fireEvent.change(field, { target: { value: "a".repeat(800) } });
    expect(screen.queryByText(/characters left/)).toBeNull();

    fireEvent.change(field, { target: { value: "a".repeat(950) } });
    expect(screen.getByText("50 characters left")).toBeTruthy();

    fireEvent.change(field, { target: { value: "a".repeat(1000) } });
    expect(screen.getByText("That is the most one message can hold.")).toBeTruthy();
  });
});
