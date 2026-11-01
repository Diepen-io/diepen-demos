"use client";

import { useEffect, useRef } from "react";
import { cx } from "../primitives/class-names";
import { Icon } from "../primitives/icon";
import type { FilmParty } from "./focus-script";

export type PartyChipsProps = {
  parties: FilmParty[];
  /** Parties with a panel right now. Their chips read as current. */
  onScreen: string[];
  /** Parties off screen with something new. Their chips carry a dot. */
  news: Set<string>;
  className?: string;
};

/**
 * The whole cast in one quiet row, always in the same order, so nothing in it moves. Phones
 * scroll it sideways and keep the party in focus in view.
 */
export function PartyChips({ parties, onScreen, news, className }: PartyChipsProps) {
  const row = useRef<HTMLUListElement>(null);
  const focus = onScreen[0];

  useEffect(() => {
    const list = row.current;
    const chip = list?.querySelector<HTMLElement>(`[data-party-chip="${focus}"]`);
    if (!list || !chip || list.scrollWidth <= list.clientWidth) return;
    // Scrolls the row only, never the page, which scrollIntoView would also do.
    list.scrollTo({ left: chip.offsetLeft - (list.clientWidth - chip.offsetWidth) / 2, behavior: "smooth" });
  }, [focus]);

  return (
    <ul
      ref={row}
      aria-label="Parties"
      className={cx(
        "flex shrink-0 gap-2 overflow-x-auto [scrollbar-width:none] max-md:-mx-4 max-md:px-4 md:flex-wrap md:justify-center",
        className,
      )}
    >
      {parties.map((party) => {
        const current = onScreen.includes(party.id);
        const fresh = news.has(party.id);
        return (
          <li
            key={party.id}
            data-party-chip={party.id}
            data-current={current || undefined}
            className={cx(
              "relative flex h-10 shrink-0 items-center gap-2 rounded-full px-3.5 text-[16px] font-medium whitespace-nowrap transition-[background-color,color,box-shadow] duration-300",
              current
                ? "bg-surface text-foreground shadow-[0_0_0_1px_var(--border),0_1px_2px_rgb(0_0_0/0.06)]"
                : "text-muted shadow-[inset_0_0_0_1px_var(--border)]",
            )}
          >
            <Icon name={party.icon ?? "user"} size={17} className={cx("shrink-0", current && party.brand && "text-brand")} />
            {party.label}
            {/* On the corner, so a dot that comes or goes never changes the chip's width. */}
            <span
              aria-hidden="true"
              className={cx(
                "absolute top-0 right-0.5 size-2.5 rounded-full bg-brand shadow-[0_0_0_2px_var(--background)] transition-opacity duration-300",
                fresh ? "opacity-100" : "opacity-0",
              )}
            />
            {fresh ? <span className="sr-only">, something new</span> : null}
          </li>
        );
      })}
    </ul>
  );
}
