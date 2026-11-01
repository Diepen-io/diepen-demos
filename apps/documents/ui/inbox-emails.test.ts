import { presets } from "@diepen/voice/presets";
import { describe, expect, it } from "vitest";
import { composeInboxEmail, type EmailRecord } from "./inbox-emails";

const followUp: EmailRecord = {
  id: "chase-1",
  kind: "follow-up",
  sentAt: "2026-03-12T12:50",
  outstanding: [{ itemId: "health-insurance", reason: "Not received yet." }],
  anyFileReceived: false,
  unread: true,
};

describe("emails written with the active profile @documents.brand", () => {
  it("writes one record in whichever profile is active, so a switch changes open emails", () => {
    for (const profile of [presets["ledgerwick-accounting"], presets["brickfern-property"]]) {
      const email = composeInboxEmail(profile, followUp);
      expect(email.from.name).toBe(profile.people.assistantName);
      expect(email.body).toContain(profile.name);
      expect(email.body.endsWith(profile.voice.signOff)).toBe(true);
    }
  });

  it("shows the weekday with the time, as an inbox does across days", () => {
    expect(composeInboxEmail(presets["ledgerwick-accounting"], followUp).time).toBe("Thu 12:50");
  });
});
