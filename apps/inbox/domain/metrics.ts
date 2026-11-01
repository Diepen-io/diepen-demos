import { firstReplySeconds, type Conversation } from "./conversation";
import { conversationStatuses, type ConversationStatus } from "./conversation-status";
import { minutesOf, wallMs } from "./wall-clock";

const average = (values: number[]) =>
  values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;

/** The "after" number: how long a customer waits for the first answer, in seconds. */
export function averageFirstReplySeconds(conversations: readonly Conversation[]): number {
  return average(conversations.flatMap((conversation) => firstReplySeconds(conversation) ?? []));
}

/**
 * The "before" number: how long each first message would wait for the business to open at
 * `opening` ("08:00"), in seconds. Arithmetic on the story, so it claims nothing about a real business.
 */
export function averageWaitUntilOpening(conversations: readonly Conversation[], opening: string): number {
  return average(
    conversations.flatMap((conversation) => {
      const first = conversation.messages.find((message) => message.role === "customer");
      if (!first) return [];
      const sent = wallMs(first.at);
      const sameDay = wallMs(first.at.slice(0, 10)) + minutesOf(opening) * 60_000;
      const opens = sameDay > sent ? sameDay : sameDay + 86_400_000;
      return [(opens - sent) / 1000];
    }),
  );
}

export function countByStatus(conversations: readonly Conversation[]): Record<ConversationStatus, number> {
  const counts = Object.fromEntries(conversationStatuses.map((status) => [status, 0])) as Record<ConversationStatus, number>;
  for (const conversation of conversations) counts[conversation.status] += 1;
  return counts;
}

const plural = (count: number, unit: string) => `${count} ${unit}${count === 1 ? "" : "s"}`;

/** "38 seconds", "12 minutes", "9 hours" or "7.5 hours". */
export function formatDuration(seconds: number): string {
  if (seconds < 90) return plural(Math.round(seconds), "second");
  if (seconds < 90 * 60) return plural(Math.round(seconds / 60), "minute");
  return plural(Math.round(seconds / 360) / 10, "hour");
}
