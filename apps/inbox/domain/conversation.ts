import type { Channel } from "./channel";
import type { ConversationStatus } from "./conversation-status";
import { wallMs } from "./wall-clock";

/**
 * The structured reply both modes render. It has the shape of `InboxReply` in
 * `@diepen/voice/tasks/inbox-reply`, so a live answer and a film fixture share one renderer.
 */
export type StructuredReply = {
  reply: string;
  intent: string;
  status: ConversationStatus;
  handoverReason?: string;
  offeredSlots?: string[];
  bookedSlot?: string;
  qualifying?: string[];
};

export type Message = {
  role: "customer" | "assistant";
  text: string;
  /** Wall-clock time the message was sent, for example "2026-11-10T21:42:00". */
  at: string;
};

export type Conversation = {
  id: string;
  channel: Channel;
  customerName: string;
  messages: Message[];
  status: ConversationStatus;
};

/** Seconds from the first customer message to the first reply, or undefined before a reply. */
export function firstReplySeconds(conversation: Pick<Conversation, "messages">): number | undefined {
  const asked = conversation.messages.find((message) => message.role === "customer");
  const answered = conversation.messages.find((message) => message.role === "assistant");
  if (!asked || !answered) return undefined;
  return Math.round((wallMs(answered.at) - wallMs(asked.at)) / 1000);
}
