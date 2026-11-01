import { stageAfterSend } from "./deal-stage";
import type { MeetingOutputs } from "./meeting-outputs";

const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** "Friday 13 November at 10:00" for a wall-clock ISO time, read as written. Null when it is no date. */
export function meetingMoment(start: string): string | null {
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/.exec(start);
  if (!match) return null;
  const date = new Date(`${match[1]}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  return `${weekdays[date.getUTCDay()]} ${date.getUTCDate()} ${months[date.getUTCMonth()]} at ${match[2]}`;
}

/** The CRM's next step once the proposal went out: the meeting the call booked. */
export function nextStepAfterSend(meeting: MeetingOutputs["nextMeeting"]): string {
  const moment = meetingMoment(meeting.start);
  return moment ? `Proposal sent. Next: ${meeting.title} on ${moment}.` : `Proposal sent. Next: ${meeting.title}.`;
}

/** The outputs after the visitor pressed send: the deal moves on and its next step is the meeting. */
export function markProposalSent(outputs: MeetingOutputs): MeetingOutputs {
  return { ...outputs, crm: { ...outputs.crm, stage: stageAfterSend, nextStep: nextStepAfterSend(outputs.nextMeeting) } };
}
