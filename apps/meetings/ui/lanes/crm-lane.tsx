import { Avatar } from "@diepen/ui/primitives/avatar";
import { cx } from "@diepen/ui/primitives/class-names";
import { Icon } from "@diepen/ui/primitives/icon";
import type { DealStage } from "@/domain/deal-stage";
import type { MeetingOutputs } from "@/domain/meeting-outputs";

export type DealRow = { company: string; contact: string; stage: DealStage; value: string };

export type CrmLaneProps = {
  /** Deals already in the pipeline, drawn quietly so the new one stands out. */
  deals: readonly DealRow[];
  record?: { deal: MeetingOutputs["crm"]; isNew: boolean; stageIsNew: boolean };
  /** Shown when there is neither a deal nor a record. */
  emptyText?: string;
};

function StagePill({ stage, isNew }: { stage: DealStage; isNew?: boolean }) {
  const sent = stage === "Proposal sent";
  return (
    <span
      key={stage}
      className={cx(
        "inline-flex h-6 shrink-0 items-center gap-1 rounded-full px-2.5 text-[12px] font-semibold whitespace-nowrap 2xl:text-[13px]",
        sent ? "bg-brand text-brand-foreground" : "bg-brand-soft text-foreground shadow-[inset_0_0_0_1px_var(--brand-line)]",
        isNew && "enter",
      )}
    >
      {sent && <Icon name="check" size={12} strokeWidth={2.5} />}
      {stage}
    </span>
  );
}

/** The pipeline: existing deals, then the deal the call created, with its stage. */
export function CrmLane({ deals, record, emptyText }: CrmLaneProps) {
  return (
    <div data-lane="crm" className="flex flex-col gap-2">
      {deals.map((deal) => (
        <div key={deal.company} className="flex items-center gap-3 rounded-xl px-3 py-2 opacity-70 shadow-[inset_0_0_0_1px_var(--border)]">
          <span className="min-w-0 flex-1 text-[14px] leading-tight">
            <span className="block truncate font-medium">{deal.company}</span>
            <span className="block truncate text-[12px] text-muted">{deal.contact}</span>
          </span>
          <span className="shrink-0 text-[12px] font-medium text-muted">{deal.stage}</span>
        </div>
      ))}
      {record ? <DealRecord {...record} /> : null}
      {!record && deals.length === 0 && emptyText ? <p className="rounded-xl bg-subtle px-3.5 py-3 text-[14px] text-muted">{emptyText}</p> : null}
    </div>
  );
}

function DealRecord({ deal, isNew, stageIsNew }: NonNullable<CrmLaneProps["record"]>) {
  return (
    <article
      data-output="crm"
      className={cx(
        "flex flex-col gap-2 rounded-xl bg-surface p-3.5 shadow-[inset_0_0_0_1.5px_var(--brand-line),0_6px_18px_-10px_rgb(0_0_0/0.25)]",
        isNew && "enter",
      )}
    >
      <header className="min-w-0">
        <h3 className="text-[15px] leading-tight font-semibold tracking-[-0.01em] 2xl:text-[17px]">{deal.company}</h3>
        <p className="mt-1 flex min-w-0 items-center gap-1.5 text-[13px] text-muted 2xl:text-[14px]">
          <Avatar name={deal.contactName} size={18} />
          <span className="truncate">
            {deal.contactName}, {deal.contactRole}
            {deal.email && <span className="text-faint"> · {deal.email}</span>}
          </span>
        </p>
      </header>
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
        <StagePill stage={deal.stage} isNew={stageIsNew} />
        <span className="min-w-0 text-[13px] font-medium 2xl:text-[14px]">{deal.dealValue}</span>
      </div>
      <p className="flex gap-2 text-[13px] leading-snug text-muted 2xl:text-[14px]">
        <Icon name="arrowRight" size={14} className="mt-0.5 shrink-0" />
        {deal.nextStep}
      </p>
    </article>
  );
}
