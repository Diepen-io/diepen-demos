import { Avatar } from "@diepen/ui/primitives/avatar";
import { cx } from "@diepen/ui/primitives/class-names";
import { Icon } from "@diepen/ui/primitives/icon";
import type { DealStage } from "@/domain/deal-stage";
import type { MeetingOutputs } from "@/domain/meeting-outputs";

export type CrmLaneProps = {
  record?: { deal: MeetingOutputs["crm"]; isNew: boolean; stageIsNew: boolean };
  /** Shown until the record lands. */
  emptyText?: string;
};

function StagePill({ stage, isNew }: { stage: DealStage; isNew?: boolean }) {
  const sent = stage === "Proposal sent";
  return (
    <span
      key={stage}
      className={cx(
        "inline-flex h-6 shrink-0 items-center gap-1 rounded-full px-2.5 text-caption font-semibold whitespace-nowrap 2xl:text-meta",
        sent ? "bg-brand text-brand-foreground" : "bg-brand-soft text-foreground shadow-[inset_0_0_0_1px_var(--brand-line)]",
        isNew && "enter",
      )}
    >
      {sent && <Icon name="check" size={12} strokeWidth={2.5} />}
      {stage}
    </span>
  );
}

/** The deal the call created, with its stage. */
export function CrmLane({ record, emptyText }: CrmLaneProps) {
  return (
    <div data-lane="crm" className="flex flex-col gap-2">
      {record ? <DealRecord {...record} /> : null}
      {!record && emptyText ? <p className="px-1 py-2 text-body text-faint">{emptyText}</p> : null}
    </div>
  );
}

function DealRecord({ deal, isNew, stageIsNew }: NonNullable<CrmLaneProps["record"]>) {
  const contact = deal.contactName === deal.company ? deal.contactRole : `${deal.contactName}, ${deal.contactRole}`;
  return (
    <article
      data-output="crm"
      className={cx(
        "flex flex-col gap-1.5 rounded-xl bg-surface px-3.5 py-3 shadow-[inset_0_0_0_1.5px_var(--brand-line),0_6px_18px_-10px_rgb(0_0_0/0.25)]",
        isNew && "enter",
      )}
    >
      <header className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
        <h3 className="min-w-0 text-body leading-tight font-semibold tracking-[-0.01em] 2xl:text-title">{deal.company}</h3>
        <StagePill stage={deal.stage} isNew={stageIsNew} />
      </header>
      <p className="flex min-w-0 items-start gap-1.5 text-meta leading-snug text-muted 2xl:text-body">
        <Avatar name={deal.contactName} size={18} className="shrink-0" />
        <span className="min-w-0">
          {contact}
          {deal.email && <span className="block text-faint [overflow-wrap:anywhere]">{deal.email}</span>}
        </span>
      </p>
      <p className="text-meta leading-snug font-medium 2xl:text-body">{deal.dealValue}</p>
      <p className="flex gap-2 text-meta leading-snug text-muted 2xl:text-body">
        <Icon name="arrowRight" size={14} className="mt-0.5 shrink-0" />
        {deal.nextStep}
      </p>
    </article>
  );
}
