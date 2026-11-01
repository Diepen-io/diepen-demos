import { z } from "zod";
import type { TaskSpec } from "../task-spec.ts";

export type InboxChannel = "email" | "instagram" | "linkedin" | "chat";

export type InboxReplyContext = {
  channel: InboxChannel;
  /** Absent for a live visitor, who gets "Hi there". */
  customerName?: string;
  /** Free calendar slots as ISO date-times. */
  openSlots: readonly string[];
  /** The current time as an ISO date-time, so the reply can say "tomorrow". */
  now: string;
};

const isoDateTime = "An ISO 8601 date-time copied exactly from the open slots in the context.";

export const inboxReplySchema = z.object({
  reply: z.string().describe("The message the customer receives, ready to send."),
  intent: z.string().describe("A few words naming what the customer wants, for example 'book a cleaning'."),
  status: z.enum(["answered", "booking_offered", "booked", "needs_human"]),
  handoverReason: z.string().optional().describe("Only with status needs_human: which handover rule applies."),
  offeredSlots: z.array(z.string().describe(isoDateTime)).optional(),
  bookedSlot: z.string().optional().describe(isoDateTime),
  qualifying: z.array(z.string()).optional().describe("The qualifying questions this reply asks."),
});

export type InboxReply = z.infer<typeof inboxReplySchema>;

const channelStyle: Record<InboxChannel, string> = {
  email:
    "This is an email. Start with a greeting that uses the customer's name (or 'Hi there' when the context has no name), answer in short paragraphs, and end with the sign-off. At most 150 words.",
  instagram:
    "This is an Instagram direct message. Write like a person on a phone: at most 60 words, no sign-off, no headings, at most one emoji and only if the customer used one.",
  linkedin:
    "This is a LinkedIn direct message. Professional and brief: at most 90 words, use the first name, end with your name only.",
  chat:
    "This is the chat widget on the website. One to three short sentences. No greeting after the first message, no sign-off.",
};

export const inboxReplyTask: TaskSpec<InboxReplyContext, InboxReply> = {
  id: "inbox-reply",
  role: "chat",
  instructions: ({ channel }) =>
    [
      "Write the next reply to the customer's latest message in this conversation.",
      channelStyle[channel],
      "",
      "Choose exactly one status:",
      "- answered: the company knowledge answers the question. Answer it.",
      "- booking_offered: the customer wants an appointment. Ask the qualifying questions you still need (which service, new or existing customer), then offer two or three times from the open slots. Put them in offeredSlots.",
      "- booked: the customer accepted one of the times you offered. Confirm the day, time and service. Put it in bookedSlot.",
      "- needs_human: a handover rule applies. Reply with the handover message in your own tone and name the rule in handoverReason.",
      "",
      "Offer only times from the open slots in the context, and copy them exactly into offeredSlots or bookedSlot.",
      "In the reply, write times the way people say them, for example 'Tuesday 4 November at 10:00'. Use the current time in the context to say 'today' or 'tomorrow' when it is true.",
      "When the context has no customer name, greet with 'Hi there' and do not guess a name.",
      "Ask at most two questions in one reply.",
    ].join("\n"),
  outputSchema: inboxReplySchema,
};
