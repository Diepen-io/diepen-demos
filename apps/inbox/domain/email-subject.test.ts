import { describe, expect, it } from "vitest";
import { subjectFrom } from "./email-subject";

describe("subjectFrom @inbox.live-chat", () => {
  it("uses the first sentence of the message", () => {
    expect(subjectFrom("What are your opening hours? I'd come on Saturday.")).toBe("What are your opening hours?");
    expect(subjectFrom("I'd like to book a cleaning. Thanks!")).toBe("I'd like to book a cleaning");
  });

  it("cuts a long first sentence at a word", () => {
    const subject = subjectFrom("I have been meaning to ask whether you also treat children who are nervous about the dentist");
    expect(subject.length).toBeLessThanOrEqual(63);
    expect(subject).toMatch(/\w\.\.\.$/);
  });
});
