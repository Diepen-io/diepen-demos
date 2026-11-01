import type { LaneContext } from "@diepen/ui/film/film-stage";
import { beatArrival, parseStoryTime, type FilmBeat, type FilmLane } from "@diepen/ui/film/film-script";
import type { CompanyProfile } from "@diepen/voice/profile";
import { memo, type ReactNode } from "react";
import { formatCallTime } from "@/domain/transcript";
import { existingDeals, existingEvents, filmWeekStart } from "@/film/fixtures/existing-tools";
import { sampleCallStartsAt } from "@/film/fixtures/sample-call";
import type { MeetingsFilmData } from "@/film/meetings-film-data";
import { AiLane } from "./ai-lane";
import { CalendarLane } from "./calendar-lane";
import { CallLane } from "./call-lane";
import { CrmLane } from "./crm-lane";
import { ProposalLane } from "./proposal-lane";

type Beat = FilmBeat<MeetingsFilmData>;
type Kind = MeetingsFilmData["kind"];
type DataOf<K extends Kind> = Extract<MeetingsFilmData, { kind: K }>;

/** An item that landed this recently enters with motion; one reached by a seek just appears. */
const freshMs = 700;
const callStart = parseStoryTime(sampleCallStartsAt);

/**
 * The film's `renderLane`. It runs on every frame, so it hands the lane only what changes the
 * picture, and the lane body re-renders when a beat lands, turns old or the call timer ticks.
 */
export function renderFilmLane(lane: FilmLane, ctx: LaneContext<MeetingsFilmData>, profile: CompanyProfile): ReactNode {
  const fresh = ctx.beats.filter((beat) => ctx.t - beatArrival(beat) < freshMs).map((beat) => beat.id);
  const callTimer = lane.id === "call" ? formatCallTime((ctx.storyTime - callStart) / 1000) : "";
  return <FilmLaneBody laneId={lane.id} beats={ctx.beats} fresh={fresh.join(" ")} callTimer={callTimer} profile={profile} />;
}

type FilmLaneBodyProps = { laneId: string; beats: Beat[]; fresh: string; callTimer: string; profile: CompanyProfile };

const FilmLaneBody = memo(
  function FilmLaneBody({ laneId, beats, fresh, callTimer, profile }: FilmLaneBodyProps) {
    const isFresh = (beat: Beat) => fresh.split(" ").includes(beat.id);
    const landed = <K extends Kind>(kind: K): { data: DataOf<K>; isNew: boolean } | undefined => {
      const beat = beats.findLast((entry): entry is FilmBeat<DataOf<K>> => entry.data.kind === kind);
      return beat ? { data: beat.data, isNew: isFresh(beat) } : undefined;
    };

    switch (laneId) {
      case "call": {
        const ended = landed("call-ended");
        const lines = beats.flatMap((beat) => (beat.data.kind === "line" ? [{ ...beat.data.line, isNew: isFresh(beat) }] : []));
        return (
          <CallLane
            seller={{ name: profile.people.owner.name, company: profile.name }}
            prospect={{ name: "Tom Becker", role: "landlord" }}
            lines={lines}
            state={ended ? "ended" : "live"}
            elapsed={ended ? ended.data.elapsed : callTimer}
          />
        );
      }
      case "ai": {
        const reading = landed("reading");
        const summary = landed("summary");
        const insights = landed("insights");
        return (
          <AiLane
            status={summary ? "done" : reading ? "reading" : "waiting"}
            waitingFor="Waiting for the call to end"
            turns={reading?.data.turns}
            summary={summary && { text: summary.data.summary, isNew: summary.isNew }}
            insights={insights && { ...insights.data, isNew: insights.isNew }}
          />
        );
      }
      case "crm": {
        const deal = landed("deal");
        const stage = landed("stage");
        const record = deal && {
          deal: { ...deal.data.deal, stage: stage?.data.stage ?? deal.data.deal.stage },
          isNew: deal.isNew,
          stageIsNew: Boolean(stage?.isNew),
        };
        return <CrmLane deals={existingDeals} record={record} />;
      }
      case "proposal": {
        const proposal = landed("proposal");
        const email = landed("email");
        return (
          <ProposalLane
            seller={profile}
            client="Tom Becker, Becker Residential"
            date="10 November 2026"
            proposal={proposal && { proposal: proposal.data.proposal, isNew: proposal.isNew }}
            email={email && { email: email.data.email, to: email.data.to, draftedAt: "14:34", isNew: email.isNew }}
            sentAt={landed("sent")?.data.time}
            emptyText="The proposal lands here when the call ends."
          />
        );
      }
      case "calendar": {
        const meeting = landed("meeting");
        const event = meeting && { id: "new-meeting", ...meeting.data.meeting };
        // The film keeps the week readable in a short lane, so the agenda shows in live mode only.
        return <CalendarLane weekStart={filmWeekStart} events={existingEvents} meeting={event && { event, agenda: [], isNew: meeting.isNew }} />;
      }
      default:
        return null;
    }
  },
  (before, after) =>
    before.laneId === after.laneId &&
    before.beats.length === after.beats.length &&
    before.fresh === after.fresh &&
    before.callTimer === after.callTimer &&
    before.profile === after.profile,
);
