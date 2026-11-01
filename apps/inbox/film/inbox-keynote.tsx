import { KeynoteBubble, KeynoteNotification, KeynoteSlot } from "@diepen/ui/film/keynote-parts";
import { defineKeynoteFilm, type KeynoteFilm } from "@diepen/ui/film/keynote-script";
import type { CompanyProfile } from "@diepen/voice/profile";
import { averageFirstReplySeconds, averageWaitUntilOpening, formatDurationShort } from "@/domain/metrics";
import { fillTemplate } from "@/domain/message-template";
import { filmConversations, filmCustomers, filmMessages, openingTime } from "./fixtures";

function textOf(id: string, profile: CompanyProfile): string {
  const message = filmMessages.find((candidate) => candidate.id === id);
  if (!message) throw new Error(`No film message ${id}`);
  return fillTemplate(message.text, profile);
}

/** The inbox film as five keynote beats: one element on screen at a time (decision F2). */
export function buildInboxKeynote(profile: CompanyProfile): KeynoteFilm {
  const priya = filmCustomers.C2.name;
  const ana = filmCustomers.C1.name;
  const daniel = filmCustomers.C4.name;
  const before = formatDurationShort(averageWaitUntilOpening(filmConversations, openingTime));
  return defineKeynoteFilm({
    id: "inbox",
    title: "Inbox autopilot",
    beats: [
      {
        id: "dm",
        caption: "Saturday, 22:14. A new DM.",
        element: <KeynoteBubble name={priya} channel="Instagram" from="customer" text={textOf("C2-1", profile)} />,
      },
      {
        id: "answered",
        caption: "Answered in 38 seconds.",
        element: (
          <KeynoteBubble
            name={profile.people.assistantName}
            initials={profile.logo.kind === "monogram" ? profile.logo.text : undefined}
            from="business"
            text={textOf("C2-2", profile)}
          />
        ),
        chip: { label: "Replied in 38 s", tone: "pass" },
      },
      {
        id: "booked",
        caption: "Booked straight into your calendar.",
        element: <KeynoteSlot day="Thu 12" time="09:00" title={fillTemplate(`{ServiceA}, ${ana}`, profile)} />,
      },
      {
        id: "edge-case",
        caption: "Edge cases go to you.",
        element: (
          <KeynoteNotification
            icon="user"
            app={`${profile.name} · Website chat`}
            title="Needs you: refund question"
            body={`${daniel} asked for a refund. The full thread is waiting.`}
          />
        ),
      },
    ],
    finale: {
      label: "Reply time",
      before,
      after: formatDurationShort(averageFirstReplySeconds(filmConversations)),
      note: `A simulation with ${profile.name}, a fictional company. ${before} is the average wait for the ${openingTime} opening.`,
    },
  });
}
