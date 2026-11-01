import type { CompanyProfile } from "@diepen/voice/profile";
import type { CallOutputs } from "@diepen/voice/tasks/call-outputs";
import { firstName, identifySides } from "@/domain/call-sides";
import { profileTokens } from "@/domain/profile-tokens";
import type { SpeakerTurn } from "@/domain/transcript";
import { prospectFigures, prospectPainPoints } from "./read-prospect";

export type MockDraftInput = { turns: readonly SpeakerTurn[]; profile: CompanyProfile; localNow: string };

const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** 10:00 on the first weekday at least two days after `localNow`, as a wall-clock ISO time. */
export function nextMeetingStart(localNow: string): string {
  const day = new Date(`${localNow.slice(0, 10)}T00:00:00Z`);
  day.setUTCDate(day.getUTCDate() + 2);
  while (day.getUTCDay() === 0 || day.getUTCDay() === 6) day.setUTCDate(day.getUTCDate() + 1);
  return `${day.toISOString().slice(0, 10)}T10:00:00`;
}

/**
 * The answer of the keyless mock provider: built from the transcript and the profile only, and
 * the same every time for the same input, so tests can check its content.
 */
export function draftMockOutputs({ turns, profile, localNow }: MockDraftInput): CallOutputs {
  const tokens = profileTokens(profile);
  const { seller, prospect } = identifySides(turns, profile);
  const prospectFirst = firstName(prospect);
  const painPoints = prospectPainPoints(turns, prospect);
  const quote = painPoints[0] ? ` ${prospectFirst} said: "${painPoints[0]}"` : "";
  const start = nextMeetingStart(localNow);
  const meetingDay = weekdayNames[new Date(`${start}Z`).getUTCDay()] ?? "the next weekday";

  return {
    summary: `Call between ${seller} of ${tokens.sellerCompany} and ${prospect}, ${turns.length} turns.${quote}`,
    numbers: prospectFigures(turns, prospect),
    painPoints: painPoints.length > 0 ? painPoints : ["The call names no pain point yet."],
    crm: {
      company: `${prospect}'s business`,
      contactName: prospect,
      contactRole: "Prospect",
      stage: "proposal",
      dealValue: tokens.servicePrice,
      nextStep: "Send the proposal and confirm the next meeting.",
    },
    proposal: {
      title: `${tokens.serviceName} for ${prospect}`,
      scope: [`${tokens.serviceName}: ${profile.knowledge.services.find((s) => s.name === tokens.serviceName)?.description ?? profile.tagline}`],
      price: tokens.servicePrice,
      timeline: "Start within two weeks of signing",
      terms: "Valid for 30 days.",
    },
    followUpEmail: {
      subject: `Your proposal from ${tokens.sellerCompany}`,
      body:
        `Hi ${prospectFirst},\n\n` +
        `Thanks for the call today. The proposal for ${tokens.serviceName} is attached, at ${tokens.servicePrice}.\n\n` +
        `${meetingDay} at 10:00 is in the calendar to go through it together.\n\n` +
        `${tokens.signOffGreeting}\n${tokens.sellerOwner}`,
    },
    nextMeeting: {
      title: `Next step with ${prospect}`,
      durationMinutes: profile.knowledge.bookingMinutes,
      start,
      agenda: ["Questions on the proposal", "Agree the start date", "Next steps"],
    },
  };
}
