"use client";

import { BrandMark } from "@diepen/ui/brand/brand-mark";
import { Badge, type BadgeTone } from "@diepen/ui/primitives/badge";
import { cx } from "@diepen/ui/primitives/class-names";
import type { CompanyProfile } from "@diepen/voice/profile";
import { statusLabels, type ConversationStatus } from "@/domain/conversation-status";
import type { OwnerRow as OwnerRowData } from "@/domain/inbox-snapshot";
import { OwnerRow } from "./owner-row";

export type OwnerViewProps = {
  company: Pick<CompanyProfile, "name" | "logo" | "colors">;
  rows: OwnerRowData[];
  /** Under the company name, for example the average first reply. */
  subtitle: string;
  showFilters: boolean;
  emptyText: string;
  className?: string;
};

const filterOrder: { status: ConversationStatus; tone: BadgeTone }[] = [
  { status: "needs_human", tone: "wait" },
  { status: "booked", tone: "pass" },
  { status: "booking_offered", tone: "info" },
  { status: "answered", tone: "neutral" },
];

/** The list an owner opens in the morning: every conversation and its status, needs a human first. */
export function OwnerView(props: OwnerViewProps) {
  const { company, rows, subtitle, showFilters, emptyText, className } = props;
  const counts = filterOrder
    .map(({ status, tone }) => ({ status, tone, count: rows.filter((row) => row.status === status).length }))
    .filter((filter) => filter.count > 0);

  return (
    <section aria-label="Owner view" className={cx("panel flex h-full min-h-0 flex-col overflow-hidden", className)}>
      <header className="flex items-center gap-3 border-b border-border px-4 py-3">
        <BrandMark profile={company} size={36} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[16px] font-semibold tracking-[-0.01em]">{company.name}</p>
          <p className="mt-0.5 flex min-w-0 items-center gap-2 text-[13px] text-muted">
            <span className="tabular truncate">{subtitle}</span>
          </p>
        </div>
      </header>
      {showFilters && counts.length > 0 ? (
        <ul aria-label="Filters" className="flex flex-wrap gap-1.5 border-b border-border px-4 py-2.5">
          {counts.map(({ status, tone, count }) => (
            <li key={status} className="enter">
              <Badge tone={tone}>
                {statusLabels[status]} <span className="tabular font-semibold">{count}</span>
              </Badge>
            </li>
          ))}
        </ul>
      ) : null}
      {rows.length === 0 ? (
        <p className="m-auto max-w-[24ch] px-4 text-center text-[14px] text-faint">{emptyText}</p>
      ) : (
        <ol className="scroll-area flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3">
          {rows.map((row) => (
            <OwnerRow key={row.id} row={row} />
          ))}
        </ol>
      )}
    </section>
  );
}
