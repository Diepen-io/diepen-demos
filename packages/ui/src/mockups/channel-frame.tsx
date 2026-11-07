import type { ReactNode } from "react";
import { cx } from "../primitives/class-names";
import { Icon, type IconName } from "../primitives/icon";

export type ChannelFrameProps = {
  /** The channel by name, for example "Instagram". Viewers read it before they read the layout. */
  channel: string;
  icon: IconName;
  /** A CSS colour for the channel glyph, usually one of the --channel-* tokens. */
  accent: string;
  /** Right side of the strip: an account, a count, a live marker. */
  meta?: ReactNode;
  className?: string;
  children: ReactNode;
};

/**
 * The window every mockup sits in. It fills its parent, so a film lane or a live layout sets
 * the size. Content gets a container, so each mockup adapts to its own width, not the page.
 */
export function ChannelFrame({ channel, icon, accent, meta, className, children }: ChannelFrameProps) {
  return (
    <section
      aria-label={channel}
      className={cx("panel @container flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden", className)}
    >
      <div className="flex h-10 shrink-0 items-center gap-2 border-b border-border bg-subtle/60 px-3.5">
        <span
          className="inline-flex size-6 items-center justify-center rounded-md text-white"
          style={{ backgroundColor: accent }}
        >
          <Icon name={icon} size={14} strokeWidth={2} />
        </span>
        <span className="text-meta font-semibold text-foreground">{channel}</span>
        {meta && <span className="ml-auto flex min-w-0 items-center gap-2 truncate text-meta text-muted">{meta}</span>}
      </div>
      <div className="relative flex min-h-0 flex-1 flex-col bg-surface">{children}</div>
    </section>
  );
}
