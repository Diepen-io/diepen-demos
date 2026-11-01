import { describe, expect, it } from "vitest";
import type { MeetingOutputs } from "./meeting-outputs";
import { markProposalSent, meetingMoment } from "./proposal-sent";

const outputs: MeetingOutputs = {
  summary: "Tom Becker wants the proposal today.",
  numbers: [],
  painPoints: [],
  crm: {
    company: "Becker Residential",
    contactName: "Tom Becker",
    contactRole: "Owner",
    stage: "Proposal drafted",
    dealValue: "EUR 34 per unit per month",
    nextStep: "Send the proposal today. Walk the three buildings on Friday 13 November at 10:00.",
  },
  proposal: { title: "Full rental management", scope: [], price: "EUR 34 per unit per month", timeline: "January", terms: "Valid for 30 days." },
  followUpEmail: { subject: "Your proposal", body: "Hi Tom" },
  nextMeeting: { title: "Walkthrough with Tom Becker", durationMinutes: 30, start: "2026-11-13T10:00:00", agenda: [] },
};

describe("markProposalSent @meetings.live-send", () => {
  it("moves the deal to Proposal sent and names the booked meeting as the next step", () => {
    const sent = markProposalSent(outputs);
    expect(sent.crm.stage).toBe("Proposal sent");
    expect(sent.crm.nextStep).toBe("Proposal sent. Next: Walkthrough with Tom Becker on Friday 13 November at 10:00.");
    expect(sent.crm.nextStep).not.toMatch(/send the proposal/i);
  });

  it("reads a meeting time as written and gives up on a start that is no date", () => {
    expect(meetingMoment("2026-11-16T09:30:00")).toBe("Monday 16 November at 09:30");
    expect(meetingMoment("next Friday")).toBeNull();
    expect(markProposalSent({ ...outputs, nextMeeting: { ...outputs.nextMeeting, start: "soon" } }).crm.nextStep).toBe(
      "Proposal sent. Next: Walkthrough with Tom Becker.",
    );
  });
});
