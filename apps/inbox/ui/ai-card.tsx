import { TypingIndicator } from "@diepen/ui/mockups/typing-indicator";
import { Badge } from "@diepen/ui/primitives/badge";
import { cx } from "@diepen/ui/primitives/class-names";
import { Icon } from "@diepen/ui/primitives/icon";
import { channelLabels } from "@/domain/channel";
import type { AiCardView } from "@/domain/inbox-snapshot";
import { ChannelMark } from "./channel-mark";
import { StatusChip } from "./status-chip";

/** What the assistant read and decided in one conversation: intent, facts, status and why. */
export function AiCard({ card, fresh }: { card: AiCardView; fresh: boolean }) {
  return (
    <article
      className={cx(
        "rounded-[12px] bg-surface p-3.5 shadow-[0_0_0_1px_var(--border),0_1px_2px_rgb(0_0_0/0.04)] transition-shadow duration-500",
        fresh && "enter",
        card.status === "needs_human" && "shadow-[0_0_0_1px_color-mix(in_oklab,var(--wait)_45%,white),0_1px_2px_rgb(0_0_0/0.04)]",
      )}
    >
      <p className="flex items-center gap-2 text-[13px] font-medium text-muted">
        <ChannelMark channel={card.channel} size={20} />
        <span className="min-w-0 truncate">
          {channelLabels[card.channel]}, <span className="text-foreground">{card.customerName}</span>
        </span>
      </p>
      {card.intent ? <h3 className="mt-2 text-[16px] leading-snug font-semibold tracking-[-0.01em] text-balance">{card.intent}</h3> : null}
      {card.tags.length > 0 ? (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {card.tags.map((tag) => (
            <li key={tag}>
              <Badge tone="brand">{tag}</Badge>
            </li>
          ))}
        </ul>
      ) : null}
      {card.policy ? (
        <p className="mt-2.5 flex items-start gap-1.5 rounded-lg bg-wait-soft px-2.5 py-1.5 text-[13px] font-medium text-wait">
          <Icon name="user" size={15} className="mt-px shrink-0" />
          {card.policy}
        </p>
      ) : null}
      <div className="mt-3 flex min-h-6 flex-wrap items-center justify-between gap-x-2 gap-y-1.5 border-t border-border pt-2.5">
        {card.typing ? (
          <span className="flex items-center gap-1.5 text-[13px] text-muted">
            <TypingIndicator label={`${card.customerName}: reply being written`} className="px-0 py-0 text-brand" />
            Writing a reply
          </span>
        ) : card.replySeconds !== undefined ? (
          <span className="tabular flex items-center gap-1.5 text-[13px] font-medium text-foreground">
            <Icon name="clock" size={15} className="text-brand" />
            Replied in {card.replySeconds} s
          </span>
        ) : (
          <span />
        )}
        {/* While a reply is being written the old status is stale, so the chip waits for the reply. */}
        {card.status && !card.typing ? <StatusChip status={card.status} /> : null}
      </div>
    </article>
  );
}
