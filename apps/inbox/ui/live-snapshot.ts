import type { CompanyProfile } from "@diepen/voice/profile";
import { busyBlocks, slotEnd } from "@/domain/calendar";
import { channelLabels, channels, type Channel } from "@/domain/channel";
import { ownerSummary, sortOwnerRows, type CalendarBlock, type OwnerRow, type ThreadView } from "@/domain/inbox-snapshot";
import { templateSlots } from "@/domain/message-template";
import type { LiveState, LiveThread } from "./live-inbox-state";

/** Turns the visitor's threads into the views the live page draws. */

const visitorDetail: Record<Channel, string> = {
  email: "you@example.com",
  instagram: "@you",
  linkedin: "Visitor",
  chat: "Visitor",
};

export function threadView(channel: Channel, thread: LiveThread): ThreadView {
  return {
    id: `live-${channel}`,
    channel,
    customer: { name: "You", detail: visitorDetail[channel] },
    subject: thread.subject,
    typing: thread.sending ? "business" : undefined,
    messages: thread.messages.map((message) => ({
      id: message.id,
      role: message.role,
      text: message.text,
      at: message.at,
      slots: message.offeredSlots?.map((iso) => ({ iso, picked: message.pickedSlot ? iso === message.pickedSlot : undefined })),
    })),
  };
}

export function liveOwnerRows(state: LiveState): OwnerRow[] {
  const rows = channels.flatMap((channel): OwnerRow[] => {
    const thread = state.threads[channel];
    const last = thread.messages.at(-1);
    if (!thread.status || !thread.lastReply || !last) return [];
    return [
      {
        id: channel,
        channel,
        name: `You on ${channelLabels[channel]}`,
        summary: ownerSummary(thread.lastReply),
        status: thread.status,
        lastActivity: last.at,
      },
    ];
  });
  return sortOwnerRows(rows);
}

/** The measured average of each conversation's first reply, for example "1.6 s". */
export function averageFirstReply(state: LiveState): string | undefined {
  const times = channels.flatMap((channel) => state.threads[channel].messages.find((message) => message.role === "assistant")?.replyMs ?? []);
  if (times.length === 0) return undefined;
  return `${(times.reduce((sum, ms) => sum + ms, 0) / times.length / 1000).toFixed(1)} s`;
}

export function liveCalendarBlocks(state: LiveState, days: string[], profile: CompanyProfile): CalendarBlock[] {
  const minutes = profile.knowledge.bookingMinutes;
  const service = templateSlots(profile).ServiceA;
  const busy = days.flatMap((day) => busyBlocks(day).map((block, index) => ({ id: `busy-${day}-${index}`, kind: "busy" as const, title: "Busy", ...block })));
  const offered = channels.flatMap((channel) =>
    state.threads[channel].offeredSlots.map((start) => ({ id: `offer-${channel}-${start}`, kind: "offered" as const, title: "Offered", start, end: slotEnd(start, minutes) })),
  );
  const booked = state.bookings.map((booking) => ({
    id: `booked-${booking.channel}-${booking.slot}`,
    kind: "booked" as const,
    title: booking.isCall ? "Call: You" : service ? `You, ${service}` : "You",
    start: booking.slot,
    end: slotEnd(booking.slot, minutes),
  }));
  return [...busy, ...offered, ...booked];
}
