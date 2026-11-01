import type { CompanyProfile } from "@diepen/voice/profile";
import type { CallOutputs } from "@diepen/voice/tasks/call-outputs";
import { identifySides } from "@/domain/call-sides";
import { firstName } from "@/domain/person-name";
import { profileTokens } from "@/domain/profile-tokens";
import { meetingMoment } from "@/domain/proposal-sent";
import { priceOnRequest, proposalService } from "@/domain/proposal-service";
import { sellerOf } from "@/domain/seller";
import type { SpeakerTurn } from "@/domain/transcript";
import { readContact } from "./read-contact";
import { prospectFigures, prospectPainPoints } from "./read-prospect";

export type MockDraftInput = { turns: readonly SpeakerTurn[]; profile: CompanyProfile; localNow: string };

/** What the CRM says about a deal the profile has no price for. */
const notPriced = "Not priced yet";

/** 10:00 on the first weekday at least two days after `localNow`, as a wall-clock ISO time. */
export function nextMeetingStart(localNow: string): string {
  const day = new Date(`${localNow.slice(0, 10)}T00:00:00Z`);
  day.setUTCDate(day.getUTCDate() + 2);
  while (day.getUTCDay() === 0 || day.getUTCDay() === 6) day.setUTCDate(day.getUTCDate() + 1);
  return `${day.toISOString().slice(0, 10)}T10:00:00`;
}

/**
 * The answer of the keyless mock provider: built from the transcript and the profile only, and
 * the same every time for the same input, so tests can check its content. It writes like a careful
 * assistant: it names only what the call said and leaves out what it cannot know.
 */
export function draftMockOutputs({ turns, profile, localNow }: MockDraftInput): CallOutputs {
  const tokens = profileTokens(profile);
  const seller = sellerOf(profile);
  const service = proposalService(profile);
  const priced = service.price !== priceOnRequest;
  const sides = identifySides(turns, profile);
  const contact = readContact(turns, sides, seller);
  const painPoints = prospectPainPoints(turns, sides.prospect);
  const start = nextMeetingStart(localNow);
  const moment = meetingMoment(start) ?? "the next weekday at 10:00";
  const meetingDay = moment.split(" ")[0] ?? "Monday";

  const client = contact.company ?? (contact.named ? contact.name : null);
  const who = contact.named ? (contact.company ? `${contact.name} of ${contact.company}` : contact.name) : "The prospect";
  const quote = painPoints[0] ? ` ${contact.named ? firstName(contact.name) : "They"} said: "${painPoints[0]}"` : "";
  const meetingTitle = contact.named ? `Proposal review with ${contact.name}` : "Proposal review";

  return {
    summary: `${who} spoke with ${seller.described} over ${turns.length} turns.${quote} Next: send the proposal and meet on ${meetingDay}.`,
    numbers: prospectFigures(turns, sides.prospect),
    painPoints: painPoints.length > 0 ? painPoints : ["The call names no pain point yet."],
    crm: {
      company: client ?? contact.name,
      contactName: contact.name,
      contactRole: "Prospect",
      ...(contact.email ? { email: contact.email } : {}),
      stage: "proposal",
      dealValue: priced ? service.price : notPriced,
      nextStep: `Send the proposal today. ${meetingTitle} on ${moment}.`,
    },
    proposal: {
      title: client ? `${service.name} for ${client}` : `${service.name} proposal`,
      scope: [service.description ? `${service.name}: ${service.description}` : service.name],
      price: service.price,
      timeline: "Start within two weeks of signing",
      terms: "Valid for 30 days.",
    },
    followUpEmail: {
      subject: `Your proposal from ${seller.company}`,
      body:
        `${contact.named ? `Hi ${firstName(contact.name)},` : "Hello,"}\n\n` +
        (priced
          ? `Thanks for the call today. I've attached the proposal for ${service.name} at ${service.price}.\n\n`
          : `Thanks for the call today. I've attached the proposal for ${service.name}, and we'll agree the price when we meet.\n\n`) +
        `${meetingDay} at 10:00 is in the calendar to go through it together.\n\n` +
        `${tokens.signOffGreeting}\n${seller.signature}`,
    },
    nextMeeting: {
      title: meetingTitle,
      durationMinutes: profile.knowledge.bookingMinutes,
      start,
      agenda: ["Questions on the proposal", "Agree the start date", "Next steps"],
    },
  };
}
