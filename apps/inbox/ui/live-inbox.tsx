"use client";

import { useBrand } from "@diepen/ui/brand/brand-provider";
import { cx } from "@diepen/ui/primitives/class-names";
import { ProviderNote } from "@diepen/ui/shell/provider-note";
import type { CompanyProfile } from "@diepen/voice/profile";
import { useMemo, useReducer, useState } from "react";
import { formatSlot, workingDaysAfter } from "@/domain/calendar";
import { channels, type Channel } from "@/domain/channel";
import { acceptsReplies } from "@/domain/conversation-status";
import { CalendarView } from "./calendar-view";
import { ChannelTabStrip } from "./channel-tab-strip";
import { ChannelThread } from "./channel-thread";
import { initialLiveState, liveInboxReducer, type LiveMessage, type LiveState } from "./live-inbox-state";
import { LivePartTabs, livePartsLabel, type LivePart } from "./live-part-tabs";
import { averageFirstReply, liveCalendarBlocks, liveOwnerRows, threadView } from "./live-snapshot";
import { OwnerView } from "./owner-view";
import { localNow, requestReply } from "./reply-client";
import { starterPrompts } from "./starter-prompts";
import { usePhoneFit } from "./use-phone-fit";
import { useVisitorNow } from "./use-visitor-now";

/** Live mode. A new company profile starts every thread and booking over, so no thread mixes two companies. */
export function LiveInbox({ providerName }: { providerName: string }) {
  const { profile, hrefWithBrand } = useBrand();
  const profileKey = useMemo(() => JSON.stringify(profile), [profile]);
  const filmHref = hrefWithBrand("/");
  const fallbackHref = `${filmHref}${filmHref.includes("?") ? "&" : "?"}fallback=limit`;
  return <LiveInboxBody key={profileKey} profile={profile} providerName={providerName} fallbackHref={fallbackHref} />;
}

type BodyProps = { profile: CompanyProfile; providerName: string; fallbackHref: string };

function LiveInboxBody({ profile, providerName, fallbackHref }: BodyProps) {
  const [state, dispatch] = useReducer(liveInboxReducer, undefined, initialLiveState);
  const [part, setPart] = useState<LivePart>("customer");
  const [seen, setSeen] = useState<Record<LivePart, string>>({ customer: "", owner: "", calendar: "" });
  const now = useVisitorNow();
  const today = now?.slice(0, 10);
  const days = useMemo(() => (today ? workingDaysAfter(`${today}T00:00`) : []), [today]);
  const rows = liveOwnerRows(state);
  const average = averageFirstReply(state);
  const changes = changeMarks(state);
  const customerPart = usePhoneFit<HTMLElement>(`[aria-label="${livePartsLabel}"]`);

  async function send(channel: Channel, text: string, subject?: string): Promise<boolean> {
    const thread = state.threads[channel];
    if (!acceptsReplies(thread.status) || thread.sending) return false;
    const at = localNow();
    dispatch({ type: "send", channel, text, at, subject });
    const outcome = await requestReply({
      channel,
      profile,
      messages: [...thread.messages.filter((message) => !message.failed), { role: "customer" as const, text }]
        .slice(-20)
        .map(({ role, text: body }) => ({ role, text: body })),
      bookings: state.bookings.map((booking) => booking.slot),
      offeredSlots: thread.offeredSlots,
      now: at,
    });
    if (outcome.kind === "fallback") {
      window.location.assign(fallbackHref);
      return true;
    }
    if (outcome.kind === "error") {
      dispatch({ type: "fail", channel });
      return false;
    }
    dispatch({ type: "reply", channel, reply: outcome.reply, replyMs: outcome.replyMs, at: localNow() });
    return true;
  }

  function showPart(next: LivePart) {
    setSeen((current) => ({ ...current, [part]: changes[part], [next]: changes[next] }));
    setPart(next);
  }

  const active = state.active;
  const thread = state.threads[active];
  const handedOver = thread.status === "needs_human";
  const hiddenOnPhone = (id: LivePart) => part !== id && "max-md:hidden";

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 pt-4 pb-24 sm:px-6 md:pb-6 lg:px-8">
      <div className="grid gap-4 md:h-[calc(100dvh-10rem)] md:min-h-[40rem] md:grid-cols-[minmax(0,55fr)_minmax(0,45fr)] md:grid-rows-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-5">
        <section ref={customerPart} aria-label="Customer" className={cx("flex min-h-0 min-w-0 flex-col gap-3 md:row-span-2", hiddenOnPhone("customer"))}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <p className="min-w-0 flex-1 text-[15px] text-muted">
              You write as the customer.{" "}
              <span className="max-sm:hidden">
                <span className="text-foreground">{profile.people.assistantName}</span> answers for {profile.name}.
              </span>
            </p>
            <ProviderNote providerName={providerName} className="self-start sm:self-auto" />
          </div>
          <ChannelTabStrip
            value={active}
            onChange={(channel) => dispatch({ type: "select", channel })}
            unread={Object.fromEntries(channels.map((channel) => [channel, state.threads[channel].unread]))}
          />
          <ChannelThread
            key={active}
            className="min-h-0 flex-1"
            thread={threadView(active, thread)}
            profile={profile}
            metaOf={(message) => messageMeta(thread.messages.find((item) => item.id === message.id))}
            controls={{
              onSend: (text, subject) => send(active, text, subject),
              starters: starterPrompts(profile),
              // The mockups grey these out and stop picks once the thread is handed over.
              onPickSlot: (iso) => void send(active, `${formatSlot(iso)} works for me.`),
              sending: thread.sending,
              notice: thread.notice,
              handover: handedOver
                ? { note: `Handed to ${profile.people.owner.name}. You get a personal reply here.`, onStartOver: () => dispatch({ type: "startOver", channel: active }) }
                : undefined,
            }}
          />
        </section>
        <div className={cx("min-h-0 min-w-0 max-md:h-[calc(100dvh-14rem)] max-md:min-h-[28rem]", hiddenOnPhone("owner"))}>
          <OwnerView
            company={profile}
            rows={rows}
            subtitle={average ? `Average first reply: ${average}` : "Every conversation lands here"}
            showFilters={rows.length > 0}
            emptyText="Send a message as the customer. The conversation shows up here."
          />
        </div>
        <div className={cx("min-h-0 min-w-0 max-md:h-[calc(100dvh-14rem)] max-md:min-h-[30rem]", hiddenOnPhone("calendar"))}>
          <CalendarView
            days={days}
            blocks={liveCalendarBlocks(state, days, profile)}
            singleDay={part === "calendar"}
            focus={calendarFocus(state)}
            className="h-full"
          />
        </div>
      </div>
      <LivePartTabs value={part} onChange={showPart} changed={{ owner: changes.owner !== seen.owner, calendar: changes.calendar !== seen.calendar }} />
    </div>
  );
}

function messageMeta(message: LiveMessage | undefined): string | undefined {
  if (message?.failed) return "Not answered";
  return message?.replyMs === undefined ? undefined : `Replied in ${(message.replyMs / 1000).toFixed(1)} s`;
}

/** The times on offer in the open thread, else the newest booking, so the calendar scrolls to them. */
function calendarFocus(state: LiveState): string[] {
  const offered = state.threads[state.active].offeredSlots;
  if (offered.length > 0) return offered;
  const booking = state.bookings.at(-1);
  return booking ? [booking.slot] : [];
}

/** A fingerprint of what each part shows, so a part that changed while hidden gets a dot. */
function changeMarks(state: LiveState): Record<LivePart, string> {
  return {
    customer: "",
    owner: liveOwnerRows(state).map((row) => `${row.id}:${row.status}`).join(","),
    calendar: state.bookings.map((booking) => booking.slot).join(","),
  };
}
