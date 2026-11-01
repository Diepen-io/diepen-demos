import { channelLooks } from "@diepen/ui/mockups/channel-looks";
import { clockForBeats, defineFocusFilm, type FilmParty, type FocusFilmScript } from "@diepen/ui/film/focus-script";
import type { CompanyProfile } from "@diepen/voice/profile";
import { fillTemplate } from "@/domain/message-template";
import { averageFirstReplySeconds, averageWaitUntilOpening, formatDuration } from "@/domain/metrics";
import { beatRows, threadParties, type BeatRow, type PartyId } from "./film-beats";
import { filmConversations, filmCustomers, openingTime, type ConversationRef } from "./fixtures";

export const filmDurationMs = 63_000;
export const endCardAtMs = 53_000;

/** What a beat tells the panels: the story moment they show, and the conversation it is about. */
export type InboxBeat = { story: string; conversation?: ConversationRef };

const storyTime = (time: string) => `${time < "12" ? "2026-11-11" : "2026-11-10"}T${time}`;

function threadParty(ref: ConversationRef): FilmParty {
  const customer = filmCustomers[ref];
  const look = channelLooks[customer.channel];
  return { id: threadParties[ref], label: customer.name, role: look.label, icon: look.icon, accent: look.accent };
}

/** In chip order: the four customers as they write, then where their conversations land. */
function parties(profile: CompanyProfile): FilmParty[] {
  return [
    ...(Object.keys(filmCustomers) as ConversationRef[]).map(threadParty),
    { id: "calendar" satisfies PartyId, label: "Calendar", role: "Bookings", icon: "calendar", accent: "var(--channel-calendar)" },
    { id: "owner" satisfies PartyId, label: profile.people.owner.name, role: "Owner", icon: "user", brand: true },
  ];
}

function endCard(profile: CompanyProfile) {
  const fill = (text: string) => fillTemplate(text, profile);
  const reason = '"Before" is how long these four messages would wait for the 08:00 opening.';
  return {
    at: endCardAtMs,
    metric: "Reply time",
    before: formatDuration(averageWaitUntilOpening(filmConversations, openingTime)),
    after: formatDuration(averageFirstReplySeconds(filmConversations)),
    lines: [
      fill("2 bookings while {company} was closed: one appointment, one call with {owner}."),
      fill("1 refund request waiting for {owner}, with the full thread."),
    ],
    note: fill(
      profile.fictional
        ? `A simulation. {company} and everyone in it are fictional. ${reason}`
        : `A simulation in {company}'s brand. The customers and messages are fictional. ${reason}`,
    ),
  };
}

function toBeat(row: BeatRow, profile: CompanyProfile) {
  return {
    id: `beat-${row.at}`,
    at: row.at,
    focus: row.focus,
    partner: row.partner,
    caption: fillTemplate(row.caption, profile),
    highlight: row.highlight,
    touches: row.touches,
    data: { story: storyTime(row.time), conversation: row.conversation },
  };
}

/** The film for one company: captions, the owner's name and the end card filled from its profile. */
export function buildInboxFilm(profile: CompanyProfile): FocusFilmScript<InboxBeat> {
  return defineFocusFilm({
    id: "inbox-autopilot",
    title: "One night, four channels",
    durationMs: filmDurationMs,
    parties: parties(profile),
    clock: clockForBeats(
      beatRows.map((row) => ({ at: row.at, time: storyTime(row.time) })),
      { durationMs: filmDurationMs, endTime: storyTime("08:01:00") },
    ),
    beats: beatRows.map((row) => toBeat(row, profile)),
    end: endCard(profile),
  });
}
