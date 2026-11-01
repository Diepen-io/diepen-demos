// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SpeechRecognizer } from "@/ui/speech/speech-recognizer";
import { RecordPanel } from "./record-panel";
import { useRecording } from "./use-recording";

type Handlers = Parameters<SpeechRecognizer["start"]>[0];

/** A recognizer the test drives by hand: it keeps the handlers the panel passes to `start`. */
function fakeRecognizer() {
  const recognizer = {
    supported: true,
    handlers: null as Handlers | null,
    start: vi.fn((handlers: Handlers) => {
      recognizer.handlers = handlers;
    }),
    stop: vi.fn(() => {
      recognizer.handlers?.onEnd();
    }),
  };
  return recognizer;
}

/** A button, radio or tab by its visible text, the way a visitor finds it. */
function control(container: HTMLElement, name: string): HTMLElement {
  const match = [...container.querySelectorAll<HTMLElement>("button, [role=radio], [role=tab]")].find(
    (element) => (element.getAttribute("aria-label") ?? element.textContent ?? "").trim() === name,
  );
  if (!match) throw new Error(`No control named "${name}"`);
  return match;
}

/** The page holds the recording and hands it to the panel; this does the same for one recognizer. */
function RecordHarness({ recognizer, onLine }: { recognizer: SpeechRecognizer; onLine: (line: string) => void }) {
  const recording = useRecording(recognizer, "Jonas", onLine);
  return createElement(RecordPanel, { supported: recognizer.supported, recording, sellerName: "Jonas" });
}

let container: HTMLElement;
let root: Root;

beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  vi.useFakeTimers({ now: new Date("2026-11-10T14:00:00Z") });
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.useRealTimers();
});

// U15. The preset's owner is Jonas Albers, so the seller option reads "Jonas".
describe("RecordPanel @meetings.live-record", () => {
  it("writes each final result as a timed line for the speaker of the toggle, and stops at 10 minutes", async () => {
    const recognizer = fakeRecognizer();
    const onLine = vi.fn();
    act(() => root.render(createElement(RecordHarness, { recognizer, onLine })));

    act(() => control(container, "Start").click());
    expect(recognizer.start).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3_000);
      recognizer.handlers?.onFinal("Thanks for making the time, Rosa.");
    });
    expect(onLine).toHaveBeenLastCalledWith("[00:03] Jonas: Thanks for making the time, Rosa.");

    act(() => control(container, "Prospect").click());
    await act(async () => {
      await vi.advanceTimersByTimeAsync(6_000);
      recognizer.handlers?.onFinal("We have 12 flats in two buildings.");
    });
    expect(onLine).toHaveBeenLastCalledWith("[00:09] Prospect: We have 12 flats in two buildings.");
    expect(onLine).toHaveBeenCalledTimes(2);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10 * 60_000 - 9_000);
    });
    expect(recognizer.stop).toHaveBeenCalled();
    expect(container.textContent).toContain("Recording stops at 10 minutes.");
  });

  it("shows interim text without writing a line", async () => {
    const recognizer = fakeRecognizer();
    const onLine = vi.fn();
    act(() => root.render(createElement(RecordHarness, { recognizer, onLine })));
    act(() => control(container, "Start").click());
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1_000);
      recognizer.handlers?.onInterim("We have twel");
    });
    expect(container.textContent).toContain("We have twel");
    expect(onLine).not.toHaveBeenCalled();
  });
});
