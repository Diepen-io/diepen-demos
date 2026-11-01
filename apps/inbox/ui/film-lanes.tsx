"use client";

import { ChannelTabs } from "@diepen/ui/mockups/channel-tabs";
import { cx } from "@diepen/ui/primitives/class-names";
import type { CompanyProfile } from "@diepen/voice/profile";
import type { InboxSnapshot, ThreadView } from "@/domain/inbox-snapshot";
import { AiCard } from "./ai-card";
import { CalendarView } from "./calendar-view";
import { ChannelThread } from "./channel-thread";
import { isFresh } from "./film-moment";
import { calendarDays } from "@/film/fixtures";
import { LaneWindow } from "./lane-window";
import { OwnerView } from "./owner-view";

export type FilmLaneProps = { laneId: string; snapshot: InboxSnapshot; t: number; profile: CompanyProfile };

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
          <CalendarView days={calendarDays} blocks={snapshot.calendarBlocks} isNew={fresh} highlight={snapshot.highlightBookings} />
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

function CustomersLane({ snapshot, t, profile }: Omit<FilmLaneProps, "laneId">) {
  const channel = snapshot.activeChannel;
  const found = snapshot.conversations.find((thread) => thread.channel === channel);
  const typing = snapshot.aiCards.some((card) => card.id === found?.id && card.typing);
  const thread: ThreadView = found
    ? { ...found, typing: typing ? "business" : undefined }
    : { id: `empty-${channel}`, channel, customer: { name: "", detail: "" }, messages: [] };
  return (
    <LaneWindow landing={0.72} dimmed={snapshot.open}>
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <ChannelTabs value={channel} />
        <ChannelThread key={thread.channel} thread={thread} profile={profile} isNew={(message) => isFresh(message.since, t)} className="min-h-0 flex-1" />
      </div>
    </LaneWindow>
  );
}
