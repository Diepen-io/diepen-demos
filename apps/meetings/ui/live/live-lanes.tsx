"use client";

import type { CompanyProfile } from "@diepen/voice/profile";
import { Button } from "@diepen/ui/primitives/button";
import { Icon } from "@diepen/ui/primitives/icon";
import { firstName } from "@/domain/call-sides";
import { AiLane } from "@/ui/lanes/ai-lane";
import { CalendarLane, mondayOf } from "@/ui/lanes/calendar-lane";
import { CrmLane } from "@/ui/lanes/crm-lane";
import { ProposalLane } from "@/ui/lanes/proposal-lane";
import { LanePanel } from "./lane-panel";
import type { LiveCall } from "./use-live-call";

export type LiveLanesProps = { call: LiveCall; profile: CompanyProfile; turns: number };

const clock = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
const longDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" });

/** The tools the outputs land in: AI notes, CRM over calendar, then proposal and email. */
export function LiveLanes({ call, profile, turns }: LiveLanesProps) {
  const { outputs, revealed, status } = call;
  const shows = (index: number) => (outputs && revealed > index ? outputs : null);
  const isNew = (index: number) => revealed === index + 1 && status === "revealing";
  const summary = shows(0);
  const insights = shows(1);
  const crm = shows(2);
  const proposal = shows(3);
  const email = shows(4);
  const meeting = shows(5);
  const prospectFirst = firstName(outputs?.crm.contactName ?? "");

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,22fr)_minmax(0,22fr)_minmax(0,30fr)] lg:items-start">
      <LanePanel id="ai" brand>
        <AiLane
          status={status === "ready" || status === "failed" ? "waiting" : status === "processing" ? "reading" : "done"}
          waitingFor="Waiting for a transcript"
          turns={turns}
          seconds={call.waitedSeconds}
          summary={summary ? { text: summary.summary, isNew: isNew(0) } : undefined}
          insights={insights ? { numbers: insights.numbers, painPoints: insights.painPoints, isNew: isNew(1) } : undefined}
        />
      </LanePanel>
      <div className="contents lg:flex lg:flex-col lg:gap-4">
        <LanePanel id="crm">
          <CrmLane deals={[]} record={crm ? { deal: crm.crm, isNew: isNew(2), stageIsNew: status === "sent" } : undefined} emptyText="The new deal lands here." />
        </LanePanel>
        <LanePanel id="calendar" className="max-lg:order-last">
          {meeting ? (
            <CalendarLane
              weekStart={mondayOf(meeting.nextMeeting.start)}
              events={[]}
              meeting={{ event: { id: "next-meeting", ...meeting.nextMeeting }, agenda: meeting.nextMeeting.agenda, isNew: isNew(5) }}
            />
          ) : (
            <p className="rounded-xl bg-subtle px-3.5 py-3 text-[14px] text-muted">The next meeting lands here.</p>
          )}
        </LanePanel>
      </div>
      <LanePanel id="proposal" brand>
        <ProposalLane
          seller={profile}
          client={outputs ? `${outputs.crm.contactName}, ${outputs.crm.company}` : ""}
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
                        <Button variant="brand" onClick={call.send} disabled={status !== "revealed"}>
                          <Icon name="send" size={16} />
                          Send to {prospectFirst || "prospect"}
                        </Button>
                        <span className="text-[13px] text-faint">Simulated email.</span>
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
