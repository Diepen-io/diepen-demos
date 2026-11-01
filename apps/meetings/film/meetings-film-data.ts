import type { DealStage } from "@/domain/deal-stage";
import type { MeetingOutputs } from "@/domain/meeting-outputs";

/** One transcript line as the film shows it. */
export type FilmCallLine = {
  /** Call time, for example "01:34". */
  time: string;
  speaker: string;
  text: string;
  /** The prospect's numbers and pain points, marked in the line. */
  highlights: string[];
};

/** What each film beat adds to its lane. Every string is already filled from the profile. */
export type MeetingsFilmData =
  | { kind: "line"; line: FilmCallLine }
  | { kind: "call-ended"; elapsed: string }
  | { kind: "reading"; turns: number }
  | { kind: "summary"; summary: string }
  | { kind: "insights"; numbers: MeetingOutputs["numbers"]; painPoints: string[] }
  | { kind: "deal"; deal: MeetingOutputs["crm"] }
  | { kind: "proposal"; proposal: MeetingOutputs["proposal"] }
  | { kind: "email"; email: MeetingOutputs["followUpEmail"]; to: string }
  | { kind: "meeting"; meeting: MeetingOutputs["nextMeeting"] }
  | { kind: "sent"; time: string }
  | { kind: "stage"; stage: DealStage };
