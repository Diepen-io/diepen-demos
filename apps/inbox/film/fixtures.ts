import type { Channel } from "@/domain/channel";
import type { Conversation, StructuredReply } from "@/domain/conversation";
import { applyReply, type ConversationStatus } from "@/domain/conversation-status";

/**
 * One night at a fictional business: four fictional customers write on four channels while it is
 * closed. Every name, price and place of the business is a slot that `fillTemplate` fills from the
 * active profile, so no text here names a real or preset company.
 */

export const storyStart = "2026-11-10T21:40:00";
/** When the simulated business opens, for the "before" number. */
export const openingTime = "08:00";
export const calendarDays = ["2026-11-11", "2026-11-12", "2026-11-13"];

export type ConversationRef = "C1" | "C2" | "C3" | "C4";

export type FilmCustomer = {
  name: string;
  channel: Channel;
  /** Email address, handle, headline or where the visitor is. */
  detail: string;
  subject?: string;
};

export const filmCustomers: Record<ConversationRef, FilmCustomer> = {
  C1: { name: "Ana Ruiz", channel: "email", detail: "ana.ruiz@example.com", subject: "Room for someone new?" },
  C2: { name: "Priya Shah", channel: "instagram", detail: "@priya.shah.studio" },
  C3: { name: "Tom Becker", channel: "linkedin", detail: "Office Manager at Fernhill Architects" },
  C4: { name: "Daniel Moore", channel: "chat", detail: "Visitor on {website}" },
};

/** The structured reply live mode returns, plus `notes`: the facts the film shows as tags. */
export type FilmReply = Omit<StructuredReply, "reply"> & { notes?: string[] };

export type FilmMessage = {
  id: string;
  conversation: ConversationRef;
  role: "customer" | "assistant";
  /** Story time. From 00:31 on it is 11 November. */
  at: string;
  text: string;
  reply?: FilmReply;
};

const night = (time: string) => `${time < "12" ? "2026-11-11" : "2026-11-10"}T${time}`;

const message = (id: string, time: string, role: FilmMessage["role"], text: string, reply?: FilmReply): FilmMessage => ({
  id,
  conversation: id.slice(0, 2) as ConversationRef,
  role,
  at: night(time),
  text,
  reply,
});

export const filmMessages: FilmMessage[] = [
  message("C1-1", "21:42:00", "customer", "Hi there,\n\nI just moved to the area. Do you have room for someone new? I'd like to book {aServiceA}, but I can only do mornings. How much is it?\n\nThanks,\nAna"),
  message("C1-2", "21:42:42", "assistant", "Hi Ana,\n\nWelcome to the area, and yes, we have room for you. [{ServiceA} costs {priceA}. ]Is anything urgent, or is this a routine visit? And which mornings suit you best?\n\n{signOff}", {
    intent: "Price and a first visit",
    status: "answered",
    qualifying: ["Is anything urgent, or is this a routine visit?", "Which mornings suit you best?"],
    notes: ["New customer", "Mornings only"],
  }),
  message("C1-3", "21:44:10", "customer", "Routine, nothing urgent. Wednesday or Thursday morning would be perfect."),
  message("C1-4", "21:44:31", "assistant", "Wednesday morning is full, but Thursday has two times free: 09:00 or 10:30. Which one should I book for you?\n\n{signOff}", {
    intent: "Booking",
    status: "booking_offered",
    offeredSlots: ["2026-11-12T09:00", "2026-11-12T10:30"],
    notes: ["Routine visit", "Wed or Thu morning"],
  }),
  message("C1-5", "21:45:05", "customer", "09:00 please!"),
  message("C1-6", "21:45:16", "assistant", "Your {serviceA} is booked for Thursday 12 November at 09:00[ at {location}]. It's in our calendar, so there's nothing else you need to do. See you on Thursday!\n\n{signOff}", {
    intent: "Booking",
    status: "booked",
    bookedSlot: "2026-11-12T09:00",
  }),
  message("C2-1", "23:13:00", "customer", "hi! do you do {serviceB}? how much is it"),
  message("C2-2", "23:13:24", "assistant", "Hi Priya! Yes, we do.[ {ServiceB} is {priceB}.] Is it for a date you have in mind, or whenever suits you?", {
    intent: "Asks about {serviceB}",
    status: "answered",
    qualifying: ["Is it for a date you have in mind?"],
  }),
  message("C2-3", "23:15:40", "customer", "it's for my sister's wedding in march, so no rush. I'll check dates with her and come back to you"),
  message("C2-4", "23:15:52", "assistant", "Congratulations to your sister! Message me here when you have dates and I'll find you a time well before March.", {
    intent: "Asks about {serviceB}",
    status: "answered",
    notes: ["Wants a date before March"],
  }),
  message("C3-1", "00:31:00", "customer", "Hello, I run the office at Fernhill Architects. We're a team of 14 and we'd like to offer {serviceA} as a staff benefit next year. Do you work with companies? Happy to set up a call."),
  message("C3-2", "00:31:36", "assistant", "Hi Tom, thanks for getting in touch. Yes, {owner} sets up company arrangements personally. Two quick questions so the call is useful: about how many of the 14 would take part, and would you like one visit day or appointments spread over the year?\n\n{assistant}", {
    intent: "Company offer for 14 people",
    status: "answered",
    qualifying: ["How many of the 14 would take part?", "One visit day or appointments spread over the year?"],
  }),
  message("C3-3", "00:33:02", "customer", "Probably 10 to 12. Spread over the year works better for us."),
  message("C3-4", "00:33:20", "assistant", "Thanks, that helps. {owner} has a {minutes}-minute call free on Wednesday at 16:00 or Friday at 10:30. Which suits you better?\n\n{assistant}", {
    intent: "Call with the owner",
    status: "booking_offered",
    offeredSlots: ["2026-11-11T16:00", "2026-11-13T10:30"],
    notes: ["10 to 12 people", "Spread over the year"],
  }),
  message("C3-5", "00:34:10", "customer", "Friday at 10:30 works."),
  message("C3-6", "00:34:19", "assistant", "Booked: a call with {owner} on Friday 13 November at 10:30. I've passed on your numbers, so you won't need to repeat them.\n\n{assistant}", {
    intent: "Call with the owner",
    status: "booked",
    bookedSlot: "2026-11-13T10:30",
  }),
  message("C4-1", "06:34:00", "customer", "Hi. I had {aServiceA} with you on Monday and I'm really not happy with how it went. I'd like a refund."),
  message("C4-2", "06:34:18", "assistant", "I'm sorry to hear that, Daniel. {handoverMessage} What's the best way to reach you, here or by phone?", {
    intent: "Refund request",
    status: "needs_human",
    handoverReason: "Refund request after a visit on Monday",
  }),
  message("C4-3", "06:35:02", "customer", "Phone please. 07700 900123"),
  message("C4-4", "06:35:10", "assistant", "Thank you, Daniel. {owner} has your number and your message.", {
    intent: "Refund request",
    status: "needs_human",
    handoverReason: "Refund request after a visit on Monday. Call back on 07700 900123",
  }),
];

function finalStatus(messages: FilmMessage[]): ConversationStatus {
  return messages.reduce<ConversationStatus | undefined>(
    (status, item) => (item.reply ? applyReply(status, item.reply.status) : status),
    undefined,
  ) ?? "answered";
}

/** The four conversations as they stand at 08:00, for the end card numbers. */
export const filmConversations: Conversation[] = (Object.keys(filmCustomers) as ConversationRef[]).map((ref) => {
  const messages = filmMessages.filter((item) => item.conversation === ref);
  return {
    id: ref,
    channel: filmCustomers[ref].channel,
    customerName: filmCustomers[ref].name,
    messages: messages.map(({ role, text, at }) => ({ role, text, at })),
    status: finalStatus(messages),
  };
});
