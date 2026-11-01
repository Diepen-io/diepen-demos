"use client";

import { AnimatePresence, motion } from "motion/react";
import type { CSSProperties, ReactNode } from "react";
import { cx } from "../primitives/class-names";
import { Icon } from "../primitives/icon";
import { EASE_OUT_POINTS } from "./film-easing";
import type { FilmParty, PanelRole } from "./focus-script";

export type FocusPanelProps = {
  party: FilmParty;
  role: PanelRole;
  /** The active beat's id. When it changes, the content fades through to the new beat's. */
  contentKey: string;
  children: ReactNode;
};

/** A slide or a glide: one move, 350 ms, ease-out. */
export const PANEL_TRANSITION = { duration: 0.35, ease: EASE_OUT_POINTS } as const;

/**
 * A fade through the background: the old picture leaves in 180 ms, the new one arrives 150 ms
 * later. Two different layouts never show on top of each other, so nothing reads twice.
 */
export const FADE_OUT = { duration: 0.18, ease: EASE_OUT_POINTS } as const;
export const FADE_IN = { duration: 0.3, delay: 0.15, ease: EASE_OUT_POINTS } as const;

/** One party's panel: its name and what it is, then the body the film's renderer draws. */
export function FocusPanel({ party, role, contentKey, children }: FocusPanelProps) {
  const tile: CSSProperties | undefined = party.accent && !party.brand ? { backgroundColor: party.accent } : undefined;
  return (
    <section
      aria-label={`${party.label}, ${party.role}`}
      data-film-panel={party.id}
      data-role={role}
      className="panel flex h-full min-h-0 min-w-0 flex-col overflow-hidden"
    >
      <header className="flex shrink-0 items-center gap-3.5 border-b border-border/70 px-5 py-3.5 md:px-6 md:py-4">
        <span
          style={tile}
          className={cx(
            "grid size-11 shrink-0 place-items-center rounded-[12px]",
            party.brand
              ? "bg-brand text-brand-foreground"
              : party.accent
                ? "text-white"
                : "bg-subtle text-muted shadow-[inset_0_0_0_1px_var(--border)]",
          )}
        >
          <Icon name={party.icon ?? "user"} size={22} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[20px] leading-tight font-semibold tracking-[-0.015em]">{party.label}</span>
          <span className="block truncate text-[16px] leading-snug text-muted">{party.role}</span>
        </span>
      </header>
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)]">
        <AnimatePresence initial={false}>
          <motion.div
            key={contentKey}
            className="col-start-1 row-start-1 flex min-h-0 flex-col p-5 md:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: FADE_IN }}
            exit={{ opacity: 0, transition: FADE_OUT }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
