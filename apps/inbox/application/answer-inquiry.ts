import type { AiProvider, ChatMessage } from "@diepen/ai/provider";
import { buildSystemPrompt } from "@diepen/voice/prompt";
import { inboxReplySchema, inboxReplyTask, type InboxReply } from "@diepen/voice/tasks/inbox-reply";
import { freeSlots } from "@/domain/calendar";
import { checkReply } from "@/domain/reply-rules";
import type { Inquiry } from "./inquiry";
import { mockInboxReply } from "./mock-inbox-reply";

export type { Inquiry } from "./inquiry";

export type InquiryAnswer = { reply: InboxReply; replyMs: number };

/** The model sees the first six free slots, enough to offer two or three times. */
const openSlotsShown = 6;
const maxMessages = 20;
const maxReplyTokens = 400;

/** Answers the customer's latest message in the company's voice, checked against the calendar. */
export async function answerInquiry({ ai }: { ai: AiProvider }, inquiry: Inquiry): Promise<InquiryAnswer> {
  const started = Date.now();
  const free = freeSlots(inquiry.now, inquiry.bookings, inquiry.profile.knowledge.bookingMinutes);
  const system = buildSystemPrompt({
    profile: inquiry.profile,
    task: inboxReplyTask,
    context: { channel: inquiry.channel, openSlots: free.slice(0, openSlotsShown), now: inquiry.now },
  });

  const reply = await ai.generateObject({
    role: inboxReplyTask.role,
    system,
    messages: toChatMessages(inquiry.messages),
    maxTokens: maxReplyTokens,
    schema: inboxReplySchema,
    mock: () => mockInboxReply(inquiry, free),
  });

  return { reply: checkReply(reply, free, inquiry.offeredSlots), replyMs: Date.now() - started };
}

/** The last 20 turns, starting with the customer, because a model conversation opens with the user. */
function toChatMessages(messages: Inquiry["messages"]): ChatMessage[] {
  const recent = messages.slice(-maxMessages);
  const start = recent.findIndex((message) => message.role === "customer");
  return recent.slice(Math.max(start, 0)).map((message) => ({
    role: message.role === "customer" ? "user" : "assistant",
    content: message.text,
  }));
}
