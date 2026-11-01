"use client";

import { cx } from "@diepen/ui/primitives/class-names";
import type { CompanyProfile } from "@diepen/voice/profile";
import type { InboxSnapshot, ThreadView } from "@/domain/inbox-snapshot";
import { AiCard } from "./ai-card";
import { calendarDays, earlierEmails } from "@/film/fixtures";
import { CalendarView } from "./calendar-view";
import { ChannelTabStrip } from "./channel-tab-strip";
import { ChannelThread } from "./channel-thread";
import { isFresh } from "./film-moment";
import { LaneWindow } from "./lane-window";
import { OwnerView } from "./owner-view";
import { useElementHeight } from "./use-element-height";
import { useWholeMessages } from "./use-whole-messages";

export type FilmLaneProps = { laneId: string; snapshot: InboxSnapshot; t: number; profile: CompanyProfile };

const roomForWebsitePx = 520;

/** The pointer moves in for 1.6 s and clicks the first row when the owner opens it, at 68 s. */
const cursorWindow = { from: 66_200, arrive: 67_800, press: [67_900, 68_250], until: 69_600 } as const;

/** One film lane, drawn from the snapshot at the current film time. */
export function FilmLane({ laneId, snapshot, t, profile }: FilmLaneProps) {
  const fresh = (item: { since?: number }) => isFresh(item.since, t);
  switch (laneId) {
    case "customers":
      return <CustomersLane snapshot={snapshot} t={t} profile={profile} />;
    case "ai":
      return (
        <div className={cx("flex flex-col gap-3 transition-opacity duration-700", snapshot.open && "opacity-40")}>
          {snapshot.aiCards.length === 0 ? (
            <p className="flex items-center gap-2.5 px-1 py-2 text-[15px] text-muted">
              <span className="size-2 rounded-full bg-brand motion-safe:animate-pulse" aria-hidden="true" />
              Waiting for messages
            </p>
          ) : (
            snapshot.aiCards.map((card) => <AiCard key={card.id} card={card} fresh={fresh(card)} />)
          )}
        </div>
      );
    case "calendar":
      return (
        <LaneWindow landing={0.55} dimmed={snapshot.open && !snapshot.highlightBookings}>
          <CalendarView
            days={calendarDays}
            blocks={snapshot.calendarBlocks}
            isNew={fresh}
            highlight={snapshot.highlightBookings}
            focus={calendarFocus(snapshot)}
            compact
          />
        </LaneWindow>
      );
    case "owner":
      return (
        <LaneWindow landing={0.5}>
          <OwnerView
            company={profile}
            rows={snapshot.ownerRows}
            subtitle={snapshot.open ? `${snapshot.ownerRows.length} from the night` : "until 08:00"}
            badge={snapshot.open ? { tone: "pass", label: "Open" } : { tone: "neutral", label: "Closed" }}
            showFilters={snapshot.open}
            openRow={snapshot.selectedRow}
            filter={snapshot.ownerFilter}
            isNew={fresh}
            cursor={cursorAt(t)}
            emptyText="No conversations yet"
          />
        </LaneWindow>
      );
    default:
      return null;
  }
}

function cursorAt(t: number) {
  if (t < cursorWindow.from || t > cursorWindow.until) return undefined;
  const progress = Math.min(1, (t - cursorWindow.from) / (cursorWindow.arrive - cursorWindow.from));
  return { progress, pressed: t >= cursorWindow.press[0] && t <= cursorWindow.press[1] };
}

/** The bookings when the calendar points back at them, else the blocks that changed last. */
function calendarFocus(snapshot: InboxSnapshot): string[] {
  const events = snapshot.calendarBlocks.filter((block) => block.kind !== "busy");
  if (snapshot.highlightBookings) return events.filter((block) => block.kind === "booked").map((block) => block.start);
  const latest = Math.max(...events.map((block) => block.since ?? 0));
  return events.filter((block) => (block.since ?? 0) === latest).map((block) => block.start);
}

function CustomersLane({ snapshot, t, profile }: Omit<FilmLaneProps, "laneId">) {
  const channel = snapshot.activeChannel;
  const found = snapshot.conversations.find((thread) => thread.channel === channel);
  const typing = snapshot.aiCards.some((card) => card.id === found?.id && card.typing);
  const thread: ThreadView = found
    ? { ...found, typing: typing ? "business" : undefined }
    : { id: `empty-${channel}`, channel, customer: { name: "", detail: "" }, messages: [] };
  const latest = [channel, thread.typing, thread.handoverNote, ...thread.messages.map((message) => message.id)].join("|");
  const threadArea = useWholeMessages<HTMLDivElement>(latest);
  // The website behind the chat needs a tall lane; a shorter one shows the chat window alone, so messages fit.
  const roomForWebsite = useElementHeight(threadArea) >= roomForWebsitePx;
  return (
    <LaneWindow landing={0.72} dimmed={snapshot.open}>
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        {/* On a phone the channel's own title bar names it, and the thread needs the room. */}
        <div className="max-md:hidden">
          <ChannelTabStrip value={channel} />
        </div>
        <div ref={threadArea} className="flex min-h-0 flex-1 flex-col">
          <ChannelThread
            key={thread.channel}
            thread={thread}
            profile={profile}
            earlierEmails={earlierEmails}
            chatLayout={roomForWebsite ? "page" : "window"}
            isNew={(message) => isFresh(message.since, t)}
            className="min-h-0 flex-1"
          />
        </div>
      </div>
    </LaneWindow>
  );
}
