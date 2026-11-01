/**
 * A call transcript as the visitor pastes, records or loads it. Four line formats are read:
 * `[mm:ss] Name: text`, `[h:mm:ss] Name: text`, `mm:ss Name: text` and `Name: text`.
 */

export type SpeakerTurn = { atSeconds?: number; speaker: string; text: string };

export const transcriptLimits = {
  minWords: 20,
  maxCharacters: 30_000,
  maxTurns: 400,
  maxRecordingMs: 10 * 60_000,
} as const;

export type TranscriptIssue = {
  kind: "too_short" | "too_long" | "too_many_turns";
  message: string;
};

export const transcriptMessages = {
  too_short: "Add a bit more of the call. It needs at least 20 words.",
  too_long: "That is over 30,000 characters. Trim it to the part of the call that matters.",
  too_many_turns: "That is over 400 turns. Trim it to the part of the call that matters.",
} as const satisfies Record<TranscriptIssue["kind"], string>;

/** Text that starts before any speaker label belongs to this speaker. */
export const unknownSpeaker = "Speaker";

const timestamp = String.raw`\d{1,2}(?::\d{2}){1,2}`;
// A label is at most 40 characters, holds no colon and starts with a letter.
const labelledLine = new RegExp(String.raw`^(?:\[(${timestamp})\]|(${timestamp})(?=\s))?\s*(\p{L}[^:]{0,39}):\s*(.*)$`, "u");

function secondsOf(time: string): number {
  return time.split(":").reduce((total, part) => total * 60 + Number(part), 0);
}

export function parseTranscript(text: string): SpeakerTurn[] {
  const turns: SpeakerTurn[] = [];
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    const match = labelledLine.exec(line);
    if (match) {
      const time = match[1] ?? match[2];
      const turn: SpeakerTurn = { speaker: (match[3] ?? "").trim(), text: (match[4] ?? "").trim() };
      if (time) turn.atSeconds = secondsOf(time);
      turns.push(turn);
      continue;
    }
    const previous = turns.at(-1);
    if (previous) previous.text = previous.text ? `${previous.text} ${line}` : line;
    else turns.push({ speaker: unknownSpeaker, text: line });
  }
  return turns;
}

/** Call time as "04:12", or "1:02:03" past the hour. */
export function formatCallTime(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = String(seconds % 60).padStart(2, "0");
  return hours > 0 ? `${hours}:${String(minutes).padStart(2, "0")}:${rest}` : `${String(minutes).padStart(2, "0")}:${rest}`;
}

export function formatTurn(turn: SpeakerTurn): string {
  const time = turn.atSeconds === undefined ? "" : `[${formatCallTime(turn.atSeconds)}] `;
  return `${time}${turn.speaker}: ${turn.text}`;
}

export function formatTranscript(turns: readonly SpeakerTurn[]): string {
  return turns.map(formatTurn).join("\n");
}

export function countWords(turns: readonly SpeakerTurn[]): number {
  return turns.reduce((total, turn) => total + turn.text.split(/\s+/).filter(Boolean).length, 0);
}

/** Every limit the transcript breaks, each with the message the visitor sees. */
export function checkTranscript(text: string): TranscriptIssue[] {
  const trimmed = text.trim();
  if (trimmed.length > transcriptLimits.maxCharacters) return [issue("too_long")];
  const turns = parseTranscript(trimmed);
  const issues: TranscriptIssue[] = [];
  if (countWords(turns) < transcriptLimits.minWords) issues.push(issue("too_short"));
  if (turns.length > transcriptLimits.maxTurns) issues.push(issue("too_many_turns"));
  return issues;
}

function issue(kind: TranscriptIssue["kind"]): TranscriptIssue {
  return { kind, message: transcriptMessages[kind] };
}
