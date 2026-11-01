import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ChannelTabs } from "./channel-tabs";
import { InstagramDm } from "./instagram-dm";

afterEach(cleanup);

const customer = { name: "You" };

function messageField() {
  return screen.getByLabelText<HTMLInputElement>("Message");
}

describe("conversation controls", () => {
  it("sends the composer text and clears the field", async () => {
    const onSend = vi.fn();
    render(<InstagramDm account="@studio" customer={customer} messages={[]} onSend={onSend} />);
    fireEvent.change(messageField(), { target: { value: "How much is a cleaning?" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Send" }));
      await Promise.resolve();
    });
    expect(onSend).toHaveBeenCalledWith("How much is a cleaning?", undefined);
    expect(messageField().value).toBe("");
  });

  it("puts the text back when onSend resolves false", async () => {
    render(<InstagramDm account="@studio" customer={customer} messages={[]} onSend={() => Promise.resolve(false)} />);
    fireEvent.change(messageField(), { target: { value: "Are you open on Saturday?" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Send" }));
      await Promise.resolve();
    });
    expect(messageField().value).toBe("Are you open on Saturday?");
  });

  it("sends a starter chip while the thread is empty", () => {
    const onSend = vi.fn();
    render(<InstagramDm account="@studio" customer={customer} messages={[]} starters={["Can I book a time this week?"]} onSend={onSend} />);
    fireEvent.click(screen.getByRole("button", { name: "Can I book a time this week?" }));
    expect(onSend).toHaveBeenCalledWith("Can I book a time this week?");
  });

  it("reports the picked slot by its ISO time", () => {
    const onPickSlot = vi.fn();
    const messages = [
      { id: "1", from: "business" as const, text: "Which suits you?", slots: [{ iso: "2026-11-12T09:00", label: "Thu 12 Nov, 09:00" }] },
    ];
    render(<InstagramDm account="@studio" customer={customer} messages={messages} onPickSlot={onPickSlot} />);
    fireEvent.click(screen.getByRole("button", { name: "Thu 12 Nov, 09:00" }));
    expect(onPickSlot).toHaveBeenCalledWith("2026-11-12T09:00");
  });

  it("greys out the offered times and stops picks after a handover", () => {
    const messages = [
      { id: "1", from: "business" as const, text: "Which suits you?", slots: [{ iso: "2026-11-12T09:00", label: "Thu 12 Nov, 09:00" }] },
    ];
    render(<InstagramDm account="@studio" customer={customer} messages={messages} onPickSlot={vi.fn()} handover={{ note: "Handed to Lena." }} />);
    expect(screen.queryByRole("button", { name: "Thu 12 Nov, 09:00" })).toBeNull();
    expect(screen.getByRole("list", { name: "Offered times" }).getAttribute("data-disabled")).toBe("true");
  });

  it("replaces the composer with the handover note", () => {
    const onStartOver = vi.fn();
    render(
      <InstagramDm account="@studio" customer={customer} messages={[]} onSend={vi.fn()} handover={{ note: "Handed to Lena. Lena replies here.", onStartOver }} />,
    );
    expect(screen.queryByLabelText("Message")).toBeNull();
    expect(screen.getByText("Handed to Lena. Lena replies here.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Start over" }));
    expect(onStartOver).toHaveBeenCalled();
  });
});

describe("ChannelTabs", () => {
  it("marks unread channels and switches on click", () => {
    const onChange = vi.fn();
    render(<ChannelTabs value="email" onChange={onChange} unread={{ instagram: true, email: true }} />);
    expect(screen.getByRole("tab", { name: "Email" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getAllByRole("img", { name: "New reply" })).toHaveLength(1);
    fireEvent.click(screen.getByRole("tab", { name: /Instagram/ }));
    expect(onChange).toHaveBeenCalledWith("instagram");
  });
});
