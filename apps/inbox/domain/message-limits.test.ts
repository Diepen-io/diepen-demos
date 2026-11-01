import { describe, expect, it } from "vitest";
import { clipAssistantText, maxAssistantMessageChars, maxCustomerMessageChars } from "./message-limits";

describe("message limits @inbox.live-chat", () => {
  it("lets an answer run longer than a customer message", () => {
    expect(maxAssistantMessageChars).toBeGreaterThan(maxCustomerMessageChars);
  });

  it("clips only answers over the limit", () => {
    expect(clipAssistantText("Hi there.")).toBe("Hi there.");
    expect(clipAssistantText("a".repeat(maxAssistantMessageChars + 50))).toHaveLength(maxAssistantMessageChars);
  });
});
