"use client";

import type { PanelContext } from "@diepen/ui/film/focus-stage";
import type { CompanyProfile } from "@diepen/voice/profile";
import { threadParties, type PartyId } from "@/film/film-beats";
import { frameAt } from "@/film/film-state";
import type { ConversationRef } from "@/film/fixtures";
import type { InboxBeat } from "@/film/inbox-film";
import { FilmDay } from "./film-day";
import { FilmOwnerList } from "./film-owner-list";
import { FilmThreadPanel } from "./film-thread";

const threadOf = new Map(Object.entries(threadParties).map(([ref, party]) => [party, ref as ConversationRef]));

/** The day the calendar opens on when no booking says otherwise: Thursday, Ana's morning. */
const defaultDay = "2026-11-12";

/** One panel body of the inbox film, drawn from the beat's story moment. */
export function InboxFilmPanel({ ctx, profile }: { ctx: PanelContext<InboxBeat>; profile: CompanyProfile }) {
  const { beat, highlight } = ctx;
  const frame = frameAt(beat.data.story, profile.knowledge.bookingMinutes);
  const party = ctx.party.id as PartyId;
  const ref = threadOf.get(party);
  if (ref) return <FilmThreadPanel thread={frame.threads[ref]} profile={profile} role={ctx.role} highlight={highlight} />;
  if (party === "owner") {
    const only = ctx.role === "partner" ? beat.data.conversation : undefined;
    return <FilmOwnerList rows={frame.ownerRows} only={only} highlight={highlight} />;
  }
  const booking = frame.bookings.find((block) => block.ref === beat.data.conversation);
  return <FilmDay day={booking?.start.slice(0, 10) ?? defaultDay} bookings={frame.bookings} highlight={highlight} />;
}
