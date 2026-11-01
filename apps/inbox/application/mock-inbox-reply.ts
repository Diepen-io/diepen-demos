import type { CompanyProfile } from "@diepen/voice/profile";
import type { InboxReply } from "@diepen/voice/tasks/inbox-reply";
import { formatSlot, spreadSlots } from "@/domain/calendar";
import { midSentence } from "@/domain/message-template";
import type { Inquiry } from "./inquiry";
import { frameForChannel, isQuestion, keyWords, overlap, sentence } from "./mock-reply-wording";

/**
 * The reply the mock provider gives when no API key is set, and in every test. The rules read
 * the customer's last message; the first rule that matches answers, always in the profile's words.
 * Like the real model, it hands over what the company knowledge cannot answer.
 */

const refundWords = ["refund", "money back", "reimburse"];
const complaintWords = [
  "complain", "complaint", "not acceptable", "unacceptable", "nobody told", "no one told", "not happy", "unhappy",
  "disappointed", "rude", "terrible", "awful", "ridiculous", "waited", "lawyer", "legal",
];
const hoursWords = ["opening hours", "open", "hours", "closing"];
const bookingWords = ["book", "appointment", "slot", "available", "availability", "time", "call", "when", "schedule"];
const priceWords = ["price", "cost", "how much", "fee", "charge"];
/** What brand extraction writes when a website lists no hours. */
const missingHours = /^$|not listed|unknown|not available/i;
const findTime = "Would you like me to find you a time?";

const mentions = (text: string, words: readonly string[]) => words.some((word) => text.includes(word));

type Service = CompanyProfile["knowledge"]["services"][number];
type Answer = Omit<InboxReply, "reply"> & { body: string };

export function mockInboxReply(inquiry: Inquiry, free: readonly string[]): InboxReply {
  const { body, ...rest } = answer(inquiry, free);
  return { ...rest, reply: frameForChannel(body, inquiry.channel, inquiry.profile) };
}

function answer(inquiry: Inquiry, free: readonly string[]): Answer {
  const { profile } = inquiry;
  const original = inquiry.messages.findLast((message) => message.role === "customer")?.text ?? "";
  const text = original.toLowerCase();

  if (mentions(text, refundWords)) return handover(profile, "Refund request", "Asked for a refund");
  if (mentions(text, complaintWords)) return handover(profile, "Complaint", "Raised a complaint");

  const picked = pickedSlot(text, inquiry.offeredSlots);
  if (picked) {
    return {
      body: `You're booked for ${formatSlot(picked)}. It's in our calendar, so there's nothing else you need to do.`,
      intent: "Booking",
      status: "booked",
      bookedSlot: picked,
    };
  }

  if (mentions(text, hoursWords)) {
    const hours = profile.knowledge.openingHours.trim();
    if (missingHours.test(hours)) return unknownToKnowledge(profile);
    return { body: `Our opening hours: ${sentence(hours)} ${findTime}`, intent: "Opening hours", status: "answered" };
  }

  const offered = spreadSlots(free);
  if (mentions(text, bookingWords) && offered.length > 0) {
    return {
      body: `I can offer ${offered.map(formatSlot).join(" or ")}. Which one suits you?`,
      intent: "Booking",
      status: "booking_offered",
      offeredSlots: offered,
    };
  }

  const words = keyWords(original);
  const service = profile.knowledge.services.find((item) => overlap(words, item.name) > 0);
  if (mentions(text, priceWords)) return priceAnswer(profile, service ?? profile.knowledge.services[0]);
  if (service) return serviceAnswer(service);

  const faq = bestFaq(profile, words);
  if (faq) return { body: faq.answer, intent: "Question", status: "answered" };
  if (isQuestion(original)) return unknownToKnowledge(profile);

  return {
    body: `Thanks for writing to ${profile.name}. I'm ${profile.people.assistantName}, and I can answer your questions or find you a time. What can I help with?`,
    intent: "General question",
    status: "answered",
  };
}

function handover(profile: CompanyProfile, intent: string, handoverReason: string): Answer {
  return { body: profile.policies.handoverMessage, intent, status: "needs_human", handoverReason };
}

/** The profile's own rule for questions it cannot answer, when it has one. */
function unknownToKnowledge(profile: CompanyProfile): Answer {
  const rule = profile.policies.handoverWhen.find((item) => /knowledge|not answer|cannot answer|unsure/i.test(item));
  return handover(profile, "Question outside the company knowledge", rule ?? "The company knowledge does not answer this question");
}

function priceAnswer(profile: CompanyProfile, service: Service | undefined): Answer {
  const body = service?.price
    ? `${service.name} costs ${service.price}. ${findTime}`
    : `Prices depend on what you need, so ${profile.people.owner.name} gives you a personal quote. ${findTime}`;
  return { body, intent: "Price question", status: "answered", qualifying: ["Asked about price"] };
}

function serviceAnswer(service: Service): Answer {
  const name = midSentence(service.name);
  const description = service.description.trim() ? ` ${sentence(service.description)}` : "";
  const price = service.price ? ` It costs ${service.price}.` : "";
  return { body: `Yes, we offer ${name}.${description}${price} ${findTime}`, intent: `Asks about ${name}`, status: "answered" };
}

/** The FAQ entry that shares the most key words with the question, if it shares enough. */
function bestFaq(profile: CompanyProfile, words: readonly string[]) {
  const needed = Math.min(2, words.length);
  if (needed === 0) return undefined;
  const best = profile.knowledge.faq
    .map((entry) => ({ entry, score: overlap(words, entry.question) }))
    .sort((a, b) => b.score - a.score)[0];
  return best && best.score >= needed ? best.entry : undefined;
}

/** The offered slot the customer names by its time, and by its day when two share a time. */
function pickedSlot(text: string, offered: readonly string[]): string | undefined {
  const byTime = offered.filter((slot) => text.includes(slot.slice(11, 16)));
  if (byTime.length <= 1) return byTime[0];
  const byDay = byTime.filter((slot) => text.includes(formatSlot(slot).toLowerCase().split(" ")[0] ?? ""));
  return byDay.length === 1 ? byDay[0] : undefined;
}
