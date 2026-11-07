"use client";

import type { CompanyProfile } from "@diepen/voice/profile";
import { spotlight } from "@diepen/ui/guide/spotlight";
import { Button } from "@diepen/ui/primitives/button";
import { cx } from "@diepen/ui/primitives/class-names";
import { Icon } from "@diepen/ui/primitives/icon";
import { mondayOf, weekLabel } from "@/domain/calendar-week";
import type { MeetingOutputs } from "@/domain/meeting-outputs";
import { firstName, isPersonName } from "@/domain/person-name";
import { AiLane } from "@/ui/lanes/ai-lane";
import { CalendarLane } from "@/ui/lanes/calendar-lane";
import { CrmLane } from "@/ui/lanes/crm-lane";
import { ProposalLane } from "@/ui/lanes/proposal-lane";
import { LanePanel } from "./lane-panel";
import { SendResult } from "./send-result";
import type { LiveCall } from "./use-live-call";

export type LiveLanesProps = {
  call: LiveCall;
  profile: CompanyProfile;
  /** The transcript changed since the outputs were drafted: they dim and cannot be sent. */
  stale: boolean;
  /** What the AI lane says before the visitor presses the button. */
  waitingFor: string;
  /** The live guide points at the send button. */
  spotlightSend?: boolean;
};

const clock = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
const longDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" });

/** "Tom Becker, Becker Residential", "Rosa", or nothing for a prospect the call never named. */
function clientLine(crm: MeetingOutputs["crm"]): string {
  if (!isPersonName(crm.contactName)) return crm.company === crm.contactName ? "" : crm.company;
  return crm.company && crm.company !== crm.contactName ? `${crm.contactName}, ${crm.company}` : crm.contactName;
}

function sendLabel(crm: MeetingOutputs["crm"]): string {
  return isPersonName(crm.contactName) ? `Send to ${firstName(crm.contactName)}` : "Send the email";
}

/** The tools the outputs land in: AI notes, CRM over calendar, then proposal and email. */
export function LiveLanes({ call, profile, stale, waitingFor, spotlightSend }: LiveLanesProps) {
  const { outputs, revealed, status } = call;
  const shows = (index: number) => (outputs && revealed > index ? outputs : null);
  const isNew = (index: number) => revealed === index + 1 && status === "revealing";
  const summary = shows(0);
  const insights = shows(1);
  const crm = shows(2);
  const proposal = shows(3);
  const email = shows(4);
  const meeting = shows(5);

  return (
    <div
      className={cx(
        "grid gap-4 transition-opacity duration-200 lg:grid-cols-[minmax(0,22fr)_minmax(0,22fr)_minmax(0,30fr)] lg:items-start",
        stale && "opacity-60",
      )}
    >
      {/* On a phone the bar shows under the email the visitor just sent, so the page does not jump. */}
      {call.sentAfterMs !== null && (
        <div className="max-lg:order-1 lg:col-span-3">
          <SendResult afterMs={call.sentAfterMs} />
        </div>
      )}
      <LanePanel id="ai" brand>
        <AiLane
          status={status === "ready" || status === "failed" ? "waiting" : status === "processing" ? "reading" : "done"}
          waitingFor={waitingFor}
          turns={call.submittedTurns}
          seconds={call.waitedSeconds}
          summary={summary ? { text: summary.summary, isNew: isNew(0) } : undefined}
          insights={insights ? { numbers: insights.numbers, painPoints: insights.painPoints, isNew: isNew(1) } : undefined}
        />
      </LanePanel>
      <div className="contents lg:flex lg:flex-col lg:gap-4">
        <LanePanel id="crm">
          <CrmLane record={crm ? { deal: crm.crm, isNew: isNew(2), stageIsNew: status === "sent" } : undefined} emptyText="The new deal lands here." />
        </LanePanel>
        <LanePanel id="calendar" role={meeting ? weekLabel(mondayOf(meeting.nextMeeting.start)) : undefined} className="max-lg:order-last">
          {meeting ? (
            <CalendarLane
              weekStart={mondayOf(meeting.nextMeeting.start)}
              meeting={{ event: { id: "next-meeting", ...meeting.nextMeeting }, agenda: meeting.nextMeeting.agenda, isNew: isNew(5) }}
            />
          ) : (
            <p className="px-1 py-2 text-body text-faint">The next meeting lands here.</p>
          )}
        </LanePanel>
      </div>
      <LanePanel id="proposal" brand>
        <ProposalLane
          seller={profile}
          client={outputs ? clientLine(outputs.crm) : ""}
          date={longDate.format(new Date())}
          proposal={proposal ? { proposal: proposal.proposal, isNew: isNew(3) } : undefined}
          emptyText="The proposal and the follow-up email land here."
          sentAt={call.sentAt ? clock.format(call.sentAt) : undefined}
          email={
            email
              ? {
                  email: email.followUpEmail,
                  to: email.crm.email ?? email.crm.contactName,
                  draftedAt: "Just now",
                  isNew: isNew(4),
                  action:
                    status === "sent" ? undefined : (
                      <div className="flex flex-wrap items-center gap-3">
                        <Button variant="brand" className="max-sm:h-11" onClick={call.send} disabled={status !== "revealed" || stale} {...spotlight(spotlightSend)}>
                          <Icon name="send" size={16} />
                          {sendLabel(email.crm)}
                        </Button>
                        <span className="text-meta text-faint">Simulated email.</span>
                      </div>
                    ),
                }
              : undefined
          }
        />
      </LanePanel>
    </div>
  );
}
