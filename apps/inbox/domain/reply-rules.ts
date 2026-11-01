import { formatSlot } from "./calendar";
import type { StructuredReply } from "./conversation";

const maxOffered = 3;

/**
 * Holds a model's reply to the calendar before it reaches the customer. Offered times must be
 * free, at most three; a booking must be free and one of the times offered in the last turn.
 * A reply that breaks a rule becomes a new offer of the first two free slots.
 */
export function checkReply<Reply extends StructuredReply>(
  reply: Reply,
  free: readonly string[],
  lastOffered: readonly string[],
): Reply {
  const isFree = (slot: string) => free.includes(slot);

  if (reply.status === "booked") {
    const slot = reply.bookedSlot;
    return slot && isFree(slot) && lastOffered.includes(slot) ? reply : newOffer(reply, free);
  }
  if (reply.offeredSlots?.length) {
    if (!reply.offeredSlots.every(isFree)) return newOffer(reply, free);
    return { ...reply, offeredSlots: reply.offeredSlots.slice(0, maxOffered) };
  }
  return reply.status === "booking_offered" ? newOffer(reply, free) : reply;
}

function newOffer<Reply extends StructuredReply>(reply: Reply, free: readonly string[]): Reply {
  const { bookedSlot: _dropped, ...rest } = reply;
  const [first, second] = free;
  if (!first) {
    return { ...rest, status: "answered", offeredSlots: undefined, reply: "There is no free time in the next three working days. Shall I ask the team to find you one?" } as Reply;
  }
  const times = second ? `${formatSlot(first)} or ${formatSlot(second)}` : formatSlot(first);
  return {
    ...rest,
    status: "booking_offered",
    offeredSlots: second ? [first, second] : [first],
    reply: `That time is no longer free. I can offer ${times}. Which one suits you?`,
  } as Reply;
}
