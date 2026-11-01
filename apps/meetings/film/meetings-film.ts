import type { IconName } from "@diepen/ui/primitives/icon";
import { defineFilmScript, type FilmBeat, type FilmScript } from "@diepen/ui/film/film-script";
import type { CompanyProfile } from "@diepen/voice/profile";
import { weekLabel } from "@/domain/calendar-week";
import { stageAfterSend } from "@/domain/deal-stage";
import { laneIds, lanes, type LaneId } from "@/domain/lanes";
import { fillTokens, profileTokens } from "@/domain/profile-tokens";
import { nextStepAfterSend } from "@/domain/proposal-sent";
import { elapsedMs, formatDuration } from "@/domain/timing-metric";
import { formatCallTime, parseTranscript } from "@/domain/transcript";
import { filmCallLines } from "./film-call-lines";
import { fillDeep } from "./fill-deep";
import { filmWeekStart } from "./fixtures/existing-tools";
import { recordedOutputs } from "./fixtures/recorded-outputs";
import { sampleCall, sampleCallEndsAt, sampleCallStartsAt } from "./fixtures/sample-call";
import type { MeetingsFilmData } from "./meetings-film-data";

export const filmDurationMs = 80_000;
const endCardAt = 67_000;
const travelMs = 900;
const sentAt = "2026-11-10T14:36:10";

const laneIcons: Record<LaneId, IconName> = { call: "mic", ai: "sparkle", crm: "briefcase", proposal: "file", calendar: "calendar" };
const brandLanes = new Set<LaneId>(["ai", "proposal"]);

type Beat = FilmBeat<MeetingsFilmData>;

/** Story clock keyframes: film ms and the wall time on Tuesday 10 November 2026. */
const clockFrames: [number, string][] = [
  [0, "14:00:00"], [3000, "14:00:17"], [5800, "14:00:44"], [8600, "14:01:00"], [11400, "14:01:17"],
  [14200, "14:01:34"], [17000, "14:01:49"], [19800, "14:18:13"], [22600, "14:24:30"], [25400, "14:27:15"],
  [28200, "14:31:46"], [31000, "14:32:10"], [33000, "14:32:20"], [36000, "14:32:40"], [40000, "14:33:00"],
  [44500, "14:33:20"], [49000, "14:33:50"], [54000, "14:34:20"], [58500, "14:34:40"], [63000, "14:36:10"],
  [endCardAt, "14:36:10"],
];

/** Captions of the transcript beats, in the order of the film's call lines. */
const lineCaptions = [
  "A discovery call with a landlord.",
  "Tom owns 14 apartments and runs them himself.",
  "Nine hours a week on tenants.",
  "Night calls are the worst part.",
  "Apartments stand empty for 38 days.",
  "About 8,700 in rent lost last year.",
  "Late rent, chased on WhatsApp.",
  "{sellerOwnerFirst} names the price.",
  "He wants it in writing today.",
  "Next step: Friday at 10:00.",
  "32 minutes in, they wrap up.",
];

/** A beat that travels so it lands exactly at `landsAt`, the moment of its row in the plan. */
function landing(landsAt: number) {
  return { at: landsAt - travelMs, durationMs: travelMs };
}

/** The meetings film for one company profile: the landlord call stays, the seller is the profile. */
export function buildMeetingsFilm(profile: CompanyProfile): FilmScript<MeetingsFilmData> {
  const tokens = profileTokens(profile);
  const fill = (text: string) => fillTokens(text, tokens);
  const outputs = fillDeep(recordedOutputs, fill);
  const turns = parseTranscript(fill(sampleCall));
  const lineAt = (time: string) => turns.find((turn) => turn.atSeconds !== undefined && formatCallTime(turn.atSeconds) === time);
  const callEndsAfter = formatCallTime(elapsedMs(sampleCallStartsAt, sampleCallEndsAt) / 1000);

  const lineBeats: Beat[] = filmCallLines.map(({ time, highlights }, index) => {
    const turn = lineAt(time);
    if (!turn) throw new Error(`The sample call has no line at ${time}`);
    return {
      id: `line-${time}`,
      at: index === 0 ? 0 : 3000 + (index - 1) * 2800,
      lane: "call",
      caption: fill(lineCaptions[index] ?? ""),
      data: { kind: "line", line: { time, speaker: turn.speaker, text: turn.text, highlights: highlights.map(fill) } },
    };
  });

  const beats: Beat[] = [
    ...lineBeats,
    { id: "call-ended", at: 31_000, lane: "call", caption: "The call ends at 14:32.", data: { kind: "call-ended", elapsed: callEndsAfter } },
    {
      id: "reading",
      ...landing(33_000),
      lane: "ai",
      caption: "The AI reads the whole call.",
      travel: { from: "call", kind: "document", label: `Transcript, ${turns.length} turns`, durationMs: travelMs },
      data: { kind: "reading", turns: turns.length },
    },
    { id: "summary", at: 36_000, lane: "ai", caption: "Summary first: who, what, when.", data: { kind: "summary", summary: outputs.summary } },
    {
      id: "insights",
      at: 40_000,
      lane: "ai",
      caption: "His numbers and his three pain points.",
      data: { kind: "insights", numbers: outputs.numbers, painPoints: outputs.painPoints },
    },
    {
      id: "deal",
      ...landing(44_500),
      lane: "crm",
      caption: "The CRM record fills itself in.",
      travel: { from: "ai", kind: "event", label: "New deal", durationMs: travelMs },
      data: { kind: "deal", deal: outputs.crm },
    },
    {
      id: "proposal",
      ...landing(49_000),
      lane: "proposal",
      caption: "A proposal with his numbers and your price.",
      travel: { from: "ai", kind: "document", label: "Proposal draft", durationMs: travelMs },
      data: { kind: "proposal", proposal: outputs.proposal },
    },
    {
      id: "email",
      at: 54_000,
      lane: "proposal",
      caption: "The follow-up email, proposal attached.",
      data: { kind: "email", email: outputs.followUpEmail, to: outputs.crm.email ?? outputs.crm.contactName },
    },
    {
      id: "meeting",
      ...landing(58_500),
      lane: "calendar",
      caption: "Friday's walkthrough is in the calendar.",
      travel: { from: "ai", kind: "event", label: "Fri 10:00", durationMs: travelMs },
      data: { kind: "meeting", meeting: { ...outputs.nextMeeting, durationMinutes: profile.knowledge.bookingMinutes } },
    },
    { id: "sent", at: 63_000, lane: "proposal", caption: fill("{sellerOwnerFirst} checks it and sends. 14:36."), data: { kind: "sent", time: "14:36" } },
    {
      id: "stage",
      at: 63_400,
      lane: "crm",
      travel: { from: "proposal", kind: "event", label: "Proposal sent", durationMs: travelMs },
      data: { kind: "stage", stage: stageAfterSend, nextStep: nextStepAfterSend(outputs.nextMeeting) },
    },
  ];

  return defineFilmScript({
    id: "meetings",
    title: "Call to close",
    durationMs: filmDurationMs,
    lanes: laneIds.map((id) => {
      const lane = lanes.find((entry) => entry.id === id);
      // The calendar's header names the week, so the lane body is the week alone.
      const role = id === "calendar" ? weekLabel(filmWeekStart) : (lane?.role ?? "");
      return { id, label: lane?.label ?? id, role, tabLabel: lane?.tab, icon: laneIcons[id], brand: brandLanes.has(id) };
    }),
    clock: clockFrames.map(([at, time]) => ({ at, time: `2026-11-10T${time}` })),
    beats,
    end: {
      at: endCardAt,
      metric: "Call end to proposal sent",
      before: "2 days",
      after: formatDuration(elapsedMs(sampleCallEndsAt, sentAt)),
      lines: [
        "Summary, CRM record, proposal, follow-up email and next meeting from one call.",
        fill("{sellerOwnerFirst} reads every draft before it goes out."),
      ],
      note: "Simulation with a fictional company and landlord. The 2 days is this scenario's manual routine: notes typed up that evening, proposal sent on Thursday.",
    },
  });
}
