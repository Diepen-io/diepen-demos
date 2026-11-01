import { describe, expect, it } from "vitest";
import { typingPaceMs } from "./typing-pace";

describe("typingPaceMs", () => {
  it("takes longer for a longer reply, between 0.7 and 2.4 seconds", () => {
    const short = typingPaceMs({ reply: "Yes." });
    const long = typingPaceMs({ reply: "x".repeat(1000) });

    expect(short).toBeGreaterThanOrEqual(700);
    expect(long).toBeGreaterThan(short);
    expect(long).toBe(2400);
  });
});
