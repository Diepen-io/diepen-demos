import { describe, expect, it } from "vitest";
import { meetingsGuide } from "./live-guide";

describe("the live guide's next step @meetings.guide", () => {
  it("loads a call, sends it to the AI, then points at Send", () => {
    expect(meetingsGuide({ status: "ready", ready: false, stale: false })).toMatchObject({ number: 1, action: "load-sample" });
    expect(meetingsGuide({ status: "ready", ready: true, stale: false })).toMatchObject({ number: 2, spotlight: "submit" });
    expect(meetingsGuide({ status: "processing", ready: true, stale: false })).toMatchObject({ waiting: true });
    expect(meetingsGuide({ status: "revealing", ready: true, stale: false })).toMatchObject({ waiting: true });
    expect(meetingsGuide({ status: "revealed", ready: true, stale: false })).toMatchObject({ number: 3, spotlight: "send" });
    expect(meetingsGuide({ status: "sent", ready: true, stale: false })).toMatchObject({ action: "end" });
    expect(meetingsGuide({ status: "sent", ready: true, stale: false }).number).toBeUndefined();
  });

  it("points at Draft again after an edit, and at Try again after a failure", () => {
    expect(meetingsGuide({ status: "revealed", ready: true, stale: true })).toMatchObject({ spotlight: "draft-again" });
    expect(meetingsGuide({ status: "failed", ready: true, stale: false })).toMatchObject({ spotlight: "try-again" });
  });
});
