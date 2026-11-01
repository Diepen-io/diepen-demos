import { KeynoteCard, KeynoteFigures } from "@diepen/ui/film/keynote-parts";
import { defineKeynoteFilm, type KeynoteFilm } from "@diepen/ui/film/keynote-script";
import type { CompanyProfile } from "@diepen/voice/profile";
import { proposalService } from "@/domain/proposal-service";
import { fillTokens, profileTokens } from "@/domain/profile-tokens";
import { sellerOf } from "@/domain/seller";
import { elapsedMs } from "@/domain/timing-metric";
import { formatCallTime } from "@/domain/transcript";
import { recordedOutputs } from "./fixtures/recorded-outputs";
import { sampleCallEndsAt, sampleCallStartsAt } from "./fixtures/sample-call";

/** The story moment the owner presses send, on the same Tuesday as the call. */
export const proposalSentAt = "2026-11-10T14:36:10";

/** One recorded figure by its label, so the film never repeats a number the fixture holds. */
function figure(label: string): string {
  const number = recordedOutputs.numbers.find((entry) => entry.label === label);
  if (!number) throw new Error(`The recorded outputs have no number "${label}"`);
  return number.value;
}

/** The meetings film as four keynote beats and the finale: one element on screen at a time (decision F2). */
export function buildMeetingsKeynote(profile: CompanyProfile): KeynoteFilm {
  const fill = (text: string) => fillTokens(text, profileTokens(profile));
  const company = sellerOf(profile).company;
  const prospect = recordedOutputs.crm.contactName;
  const minutes = Math.round(elapsedMs(sampleCallEndsAt, proposalSentAt) / 60_000);
  return defineKeynoteFilm({
    id: "meetings",
    title: "Call to close",
    beats: [
      {
        id: "call-ended",
        caption: "The call ends.",
        element: (
          <KeynoteCard
            icon="phone"
            eyebrow="Discovery call"
            title={`Call with ${prospect}`}
            value={formatCallTime(elapsedMs(sampleCallStartsAt, sampleCallEndsAt) / 1000)}
            lines={["Call ended"]}
          />
        ),
      },
      {
        id: "numbers",
        caption: "The numbers, pulled from the call.",
        element: (
          <KeynoteFigures
            figures={[
              { value: figure("Apartments"), label: "Apartments" },
              { value: figure("Days empty between tenants"), label: "Days empty" },
              { value: `${figure("Hours a week on tenants")} h`, label: "A week on tenants" },
            ]}
          />
        ),
      },
      {
        id: "proposal",
        caption: "Proposal drafted.",
        element: <KeynoteCard icon="file" eyebrow={company} title={fill(recordedOutputs.proposal.title)} value={proposalService(profile).price} />,
      },
      {
        id: "sent",
        caption: `Sent ${minutes} minutes later.`,
        element: (
          <KeynoteCard icon="mail" eyebrow="Follow-up email" title={fill(recordedOutputs.followUpEmail.subject)} lines={[`To ${prospect}`]} />
        ),
        chip: { label: `Sent ${proposalSentAt.slice(11, 16)}`, tone: "pass" },
      },
    ],
    finale: {
      label: "Call end to proposal sent",
      before: "2 days",
      after: `${minutes} min`,
      note: `A simulation with ${company}, a fictional company. 2 days is this scenario's manual routine: notes typed up that evening, proposal sent on Thursday.`,
    },
  });
}
