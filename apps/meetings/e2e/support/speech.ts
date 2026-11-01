import type { Page } from "@playwright/test";

/**
 * Playwright's Chromium has `webkitSpeechRecognition` but no microphone, so no test touches the
 * real recognizer: each one removes the API or installs this fake before the page loads.
 */

/** Removes both constructors, as in Firefox. */
export async function removeSpeechRecognition(page: Page) {
  await page.addInitScript(() => {
    const scope = window as unknown as Record<string, unknown>;
    for (const name of ["SpeechRecognition", "webkitSpeechRecognition"]) {
      delete scope[name];
      if (name in scope) Object.defineProperty(window, name, { value: undefined, configurable: true, writable: true });
    }
  });
}

export type FakeSpeechMode =
  /** Fires `error` with `not-allowed` on start, as a blocked microphone does. */
  | "denied"
  /** Waits for the test to call `fakeSpeechSays`. */
  | "manual";

/** Installs a fake SpeechRecognition under both names. */
export async function installFakeSpeech(page: Page, mode: FakeSpeechMode) {
  await page.addInitScript((fakeMode: FakeSpeechMode) => {
    type Alternative = { transcript: string; confidence: number };
    type Result = Alternative[] & { isFinal: boolean; item: (index: number) => Alternative | undefined };

    /** Recognizers that are listening, newest last. The test speaks to the newest. */
    const listening: FakeRecognition[] = [];

    class FakeRecognition extends EventTarget {
      continuous = false;
      interimResults = false;
      lang = "";
      private results: Result[] = [];

      start() {
        listening.push(this);
        this.results = [];
        setTimeout(() => {
          this.fire("start", {});
          if (fakeMode === "denied") {
            this.fire("error", { error: "not-allowed", message: "" });
            this.end();
          }
        }, 50);
      }

      stop() {
        setTimeout(() => this.end(), 50);
      }

      abort() {
        this.stop();
      }

      say(text: string, isFinal: boolean) {
        const result = Object.assign([{ transcript: text, confidence: 0.9 }], {
          isFinal,
          item(this: Result, index: number) {
            return this[index];
          },
        });
        const last = this.results.at(-1);
        const index = last && !last.isFinal ? this.results.length - 1 : this.results.length;
        this.results[index] = result;
        const results = Object.assign([...this.results], {
          item(this: Result[], at: number) {
            return this[at];
          },
        });
        this.fire("result", { resultIndex: index, results });
      }

      private end() {
        const index = listening.indexOf(this);
        if (index >= 0) listening.splice(index, 1);
        this.fire("end", {});
      }

      private fire(type: string, fields: Record<string, unknown>) {
        const event = Object.assign(new Event(type), fields);
        this.dispatchEvent(event);
        const handler = (this as unknown as Record<string, unknown>)[`on${type}`];
        if (typeof handler === "function") (handler as (event: Event) => void).call(this, event);
      }
    }

    const scope = window as unknown as Record<string, unknown>;
    scope.SpeechRecognition = FakeRecognition;
    scope.webkitSpeechRecognition = FakeRecognition;
    scope.__fakeSpeech = {
      say: (text: string, isFinal: boolean) => {
        const active = listening.at(-1);
        if (!active) throw new Error("The fake recognizer is not listening");
        active.say(text, isFinal);
      },
    };
  }, mode);
}

/** Makes the fake recognizer hear `text`, as an interim result first and then as a final one. */
export async function fakeSpeechSays(page: Page, text: string) {
  await page.evaluate((spoken) => {
    const fake = (window as unknown as { __fakeSpeech: { say: (text: string, isFinal: boolean) => void } }).__fakeSpeech;
    fake.say(spoken.slice(0, Math.ceil(spoken.length / 2)), false);
    fake.say(spoken, true);
  }, text);
}
