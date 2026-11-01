import { defineFilmScript, type FilmBeat, type FilmLane, type FilmScript } from "@diepen/ui/film/film-script";
import type { CompanyProfile } from "@diepen/voice/profile";
import { fillTemplate } from "@/domain/message-template";
import { averageFirstReplySeconds, averageWaitUntilOpening, formatDuration } from "@/domain/metrics";
import { beatRows, type BeatRow } from "./film-beats";
import type { InboxBeat } from "./film-effects";
import { filmConversations, openingTime } from "./fixtures";

export const filmDurationMs = 86_000;
export const endCardAtMs = 76_000;

const lanes: FilmLane[] = [
  { id: "customers", label: "Customers", role: "4 channels", icon: "chat" },
  { id: "ai", label: "{assistant}", role: "AI assistant", icon: "sparkle", brand: true },
  { id: "calendar", label: "Calendar", role: "Bookings", icon: "calendar" },
  { id: "owner", label: "{owner}", role: "Owner view", icon: "user" },
];

const storyTime = (time: string) => `${time < "12" ? "2026-11-11" : "2026-11-10"}T${time}`;

/** Fills every string in a value, at any depth, so no slot reaches the screen unfilled. */
function fillAll<T>(value: T, profile: CompanyProfile): T {
  if (typeof value === "string") return fillTemplate(value, profile) as T;
  if (Array.isArray(value)) return value.map((item: unknown) => fillAll(item, profile)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, fillAll(item, profile)])) as T;
  }
  return value;
}

function toBeat(row: BeatRow, index: number): FilmBeat<InboxBeat> {
  return {
    id: `beat-${index}-${row.at}`,
    at: row.at,
    lane: row.lane,
    caption: row.caption,
    travel: row.travel,
    data: { story: storyTime(row.time), effects: row.effects },
  };
}

function endCard(profile: CompanyProfile) {
  const before = averageWaitUntilOpening(filmConversations, openingTime);
  const reason = '"Before" is how long these four messages would wait for the 08:00 opening.';
  return {
    at: endCardAtMs,
    metric: "Reply time",
    before: formatDuration(before),
    after: formatDuration(averageFirstReplySeconds(filmConversations)),
    lines: [
      "2 bookings while {company} was closed: one appointment, one call with {owner}.",
      "1 refund request waiting for {owner}, with the full thread.",
      "4 of 4 messages answered before 08:00.",
    ],
    note: profile.fictional
      ? `A simulation. {company} and everyone in it are fictional. ${reason}`
      : `A simulation in {company}'s brand. The customers and messages are fictional. ${reason}`,
  };
}

/** The film for one company: every caption, label, message and end card line filled from its profile. */
export function buildInboxFilm(profile: CompanyProfile): FilmScript<InboxBeat> {
  const clock = [
    ...beatRows.map((row) => ({ at: row.at, time: storyTime(row.time), curve: row.ease ? ("ease" as const) : ("linear" as const) })),
    { at: filmDurationMs, time: storyTime("08:01:00"), curve: "linear" as const },
  ];
  return defineFilmScript(
    fillAll(
      {
        id: "inbox-autopilot",
        title: "One night, four channels",
        durationMs: filmDurationMs,
        lanes,
        clock,
        beats: beatRows.map(toBeat),
        end: endCard(profile),
      },
      profile,
    ),
  );
}
