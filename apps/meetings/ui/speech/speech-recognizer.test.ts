import { describe, expect, it, vi } from "vitest";
import { createSpeechRecognizer } from "./speech-recognizer";

type FakeAlternative = { transcript: string; confidence: number };
type FakeResult = FakeAlternative[] & { isFinal: boolean; item: (index: number) => FakeAlternative | undefined };

/**
 * Stands in for the browser's SpeechRecognition. It accepts handlers both as `on*` properties and
 * through `addEventListener`, and keeps results cumulative with a `resultIndex`, as Chrome does.
 */
class FakeRecognition extends EventTarget {
  static instances: FakeRecognition[] = [];
  continuous = false;
  interimResults = false;
  lang = "";
  started = false;
  private results: FakeResult[] = [];

  constructor() {
    super();
    FakeRecognition.instances.push(this);
  }

  start() {
    this.started = true;
  }

  stop() {
    this.started = false;
    this.fire("end", {});
  }

  abort() {
    this.stop();
  }

  speak(text: string, isFinal: boolean) {
    const result = Object.assign([{ transcript: text, confidence: 0.9 }], {
      isFinal,
      item(this: FakeResult, index: number) {
        return this[index];
      },
    });
    // An interim result is replaced by the next result at the same index, until it is final.
    const last = this.results.at(-1);
    const index = last && !last.isFinal ? this.results.length - 1 : this.results.length;
    this.results[index] = result;
    const results = Object.assign([...this.results], {
      item(this: FakeResult[], at: number) {
        return this[at];
      },
    });
    this.fire("result", { resultIndex: index, results });
  }

  fail(error: string) {
    this.fire("error", { error, message: "" });
  }

  private fire(type: string, fields: Record<string, unknown>) {
    const event = Object.assign(new Event(type), fields);
    this.dispatchEvent(event);
    const handler = (this as unknown as Record<string, unknown>)[`on${type}`];
    if (typeof handler === "function") (handler as (event: Event) => void).call(this, event);
  }
}

function fakeWindow(constructors: Record<string, unknown>): Window {
  return { ...constructors, navigator: { language: "en-GB" } } as unknown as Window;
}

function handlers() {
  return { onInterim: vi.fn(), onFinal: vi.fn(), onError: vi.fn(), onEnd: vi.fn() };
}

// U14
describe("createSpeechRecognizer @meetings.live-record", () => {
  it("is unsupported on a window without either constructor", () => {
    const recognizer = createSpeechRecognizer(fakeWindow({}));
    expect(recognizer.supported).toBe(false);
    expect(() => recognizer.start(handlers())).not.toThrow();
    expect(() => recognizer.stop()).not.toThrow();
  });

  it.each(["SpeechRecognition", "webkitSpeechRecognition"])("uses %s, continuous with interim results", (name) => {
    FakeRecognition.instances = [];
    const recognizer = createSpeechRecognizer(fakeWindow({ [name]: FakeRecognition }));
    expect(recognizer.supported).toBe(true);
    recognizer.start(handlers());
    const recognition = FakeRecognition.instances.at(-1);
    expect(recognition?.started).toBe(true);
    expect(recognition?.continuous).toBe(true);
    expect(recognition?.interimResults).toBe(true);
    expect(recognition?.lang).toBe("en-GB");
  });

  it("passes interim results to onInterim and final results to onFinal", () => {
    FakeRecognition.instances = [];
    const recognizer = createSpeechRecognizer(fakeWindow({ webkitSpeechRecognition: FakeRecognition }));
    const on = handlers();
    recognizer.start(on);
    const recognition = FakeRecognition.instances.at(-1);
    recognition?.speak("We have twelve", false);
    recognition?.speak("We have twelve flats", true);
    recognition?.speak("in two buildings", true);
    expect(on.onInterim).toHaveBeenCalledWith("We have twelve");
    expect(on.onFinal.mock.calls.map(([text]) => String(text).trim())).toEqual(["We have twelve flats", "in two buildings"]);
  });

  it("maps not-allowed to denied, no-speech to no-speech and anything else to other", () => {
    FakeRecognition.instances = [];
    const recognizer = createSpeechRecognizer(fakeWindow({ SpeechRecognition: FakeRecognition }));
    const on = handlers();
    recognizer.start(on);
    const recognition = FakeRecognition.instances.at(-1);
    recognition?.fail("not-allowed");
    recognition?.fail("service-not-allowed");
    recognition?.fail("no-speech");
    recognition?.fail("network");
    expect(on.onError.mock.calls.map(([kind]) => kind as unknown)).toEqual(["denied", "denied", "no-speech", "other"]);
  });

  it("reports the end of a session", () => {
    FakeRecognition.instances = [];
    const recognizer = createSpeechRecognizer(fakeWindow({ SpeechRecognition: FakeRecognition }));
    const on = handlers();
    recognizer.start(on);
    recognizer.stop();
    expect(on.onEnd).toHaveBeenCalled();
  });
});
