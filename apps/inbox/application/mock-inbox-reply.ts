import type { InboxReply } from "@diepen/voice/tasks/inbox-reply";
import { formatSlot } from "@/domain/calendar";
import type { Inquiry } from "./inquiry";

/**
 * The reply the mock provider gives when no API key is set, and in every test. The rules read
 * the customer's last message; the first rule that matches answers, always in the profile's words.
 */

const handoverWords = ["refund", "money back", "complain", "complaint", "lawyer", "legal"];
const hoursWords = ["opening hours", "open", "hours"];
const bookingWords = ["book", "appointment", "slot", "available", "time", "call", "when"];
const priceWords = ["price", "cost", "how much", "fee"];

const mentions = (text: string, words: readonly string[]) => words.some((word) => text.includes(word));

export function mockInboxReply(inquiry: Inquiry, free: readonly string[]): InboxReply {
  const { profile } = inquiry;
  const text = inquiry.messages.findLast((message) => message.role === "customer")?.text.toLowerCase() ?? "";
  const [service] = profile.knowledge.services;
  const findTime = "Would you like me to find you a time?";

  if (mentions(text, handoverWords)) {
    return {
      reply: profile.policies.handoverMessage,
      intent: "Refund or complaint",
      status: "needs_human",
      handoverReason: "Asked for a refund or raised a complaint",
    };
  }

  const named = inquiry.offeredSlots.filter((slot) => text.includes(slot.slice(11, 16)));
  const [picked] = named;
  if (named.length === 1 && picked) {
    return {
      reply: `You're booked for ${formatSlot(picked)}. It's in the ${profile.name} calendar.`,
      intent: "Booking",
      status: "booked",
      bookedSlot: picked,
    };
  }

  if (mentions(text, hoursWords)) {
    const hours = profile.knowledge.openingHours.trim().replace(/\.$/, "");
    return { reply: `We're open ${hours}. ${findTime}`, intent: "Opening hours", status: "answered" };
  }

  const [first, second] = free;
  if (mentions(text, bookingWords) && first) {
    const offered = second ? [first, second] : [first];
    return {
      reply: `I can offer ${offered.map(formatSlot).join(" or ")}. Which one should I book for you?`,
      intent: "Booking",
      status: "booking_offered",
      offeredSlots: offered,
    };
  }

  if (mentions(text, priceWords)) {
    const name = service?.name ?? "a first visit";
    const reply = service?.price
      ? `${name} costs ${service.price}. ${findTime}`
      : `${profile.people.owner.name} confirms the price for ${name.toLowerCase()} at your first visit. ${findTime}`;
    return { reply, intent: "Price question", status: "answered", qualifying: ["Asked about price"] };
  }

  return {
    reply: `Thanks for writing to ${profile.name}! I'm ${profile.people.assistantName}. I can answer questions or book you a time. What do you need?`,
    intent: "General question",
    status: "answered",
  };
}
