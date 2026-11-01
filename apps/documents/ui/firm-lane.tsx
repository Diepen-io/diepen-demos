import type { ChecklistSummary } from "@/domain/checklist-summary";
import { requestItem, type ItemId, type ItemState } from "@/domain/document-request";
import { Checklist } from "@diepen/ui/mockups/checklist";
import { cx } from "@diepen/ui/primitives/class-names";
import { Icon } from "@diepen/ui/primitives/icon";

export type FirmRow = { id: ItemId; state: ItemState; note?: string; fresh?: boolean };

export type FirmLaneProps = {
  rows: FirmRow[];
  summary?: ChecklistSummary;
  complete: boolean;
  /** The task the firm gets after two unanswered reminders. */
  escalation?: { subject: string; body: string };
  freshSummary?: boolean;
};

function SummaryCard({ summary, complete, fresh }: { summary: ChecklistSummary; complete: boolean; fresh?: boolean }) {
  return (
    <section
      aria-label="Summary"
      className={cx(
        "flex shrink-0 flex-col gap-2.5 rounded-xl p-4",
        complete ? "bg-pass-soft shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--pass)_25%,white)]" : "bg-surface shadow-[inset_0_0_0_1px_var(--border)]",
        fresh && "enter",
      )}
    >
      <p className="flex items-center gap-2 text-[16px] leading-snug font-semibold">
        {complete && <Icon name="check" size={18} className="shrink-0 text-pass" />}
        {complete ? "Complete. Ready to prepare the return." : summary.headline}
      </p>
      {complete && <p className="text-meta text-muted">{summary.headline}</p>}
      {summary.problems.map((problem) => (
        <p key={problem.itemId} className="flex gap-2 text-[14px] leading-snug">
          <span className="mt-[0.45em] size-1.5 shrink-0 rounded-full bg-fail" aria-hidden="true" />
          <span>
            <span className="font-medium">{problem.label}</span>
            <span className="text-fail">: {problem.note}</span>
          </span>
        </p>
      ))}
      {summary.figures.length > 0 && (
        <dl className="flex flex-wrap gap-1.5">
          {summary.figures.map((figure) => (
            <div key={figure.label} className="flex gap-1.5 rounded-lg bg-subtle px-2 py-1 text-meta">
              <dt className="text-muted">{figure.label}</dt>
              <dd className="tabular font-medium">{figure.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}

function EscalationTask({ subject, body }: { subject: string; body: string }) {
  return (
    <section aria-label="Task" className="enter flex shrink-0 flex-col gap-2 rounded-xl bg-wait-soft p-4 shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--wait)_25%,white)]">
      <p className="flex items-center gap-2 text-meta font-semibold text-wait">
        <Icon name="phone" size={15} /> Task for the team
      </p>
      <p className="text-[16px] leading-snug font-semibold">{subject}</p>
      <p className="text-meta whitespace-pre-line text-muted">{body.split("\n\n").slice(1).join("\n")}</p>
    </section>
  );
}

/** The firm's view of Daniel's request: the checklist, the one summary, and a task when chasing ends. */
export function FirmLane({ rows, summary, complete, escalation, freshSummary }: FirmLaneProps) {
  return (
    <div className="scroll-area flex h-full min-h-0 flex-col gap-3 overflow-y-auto">
      <div className="flex min-h-64 flex-1 flex-col">
        <Checklist
          client={{ name: "Daniel Okafor", detail: "Tax return 2025, due 31 Mar 2026" }}
          title="Tax return 2025"
          items={rows.map((row) => ({
            id: row.id,
            name: requestItem(row.id).label,
            status: row.state,
            note: row.note,
            isNew: row.fresh,
          }))}
        />
      </div>
      {escalation && <EscalationTask {...escalation} />}
      {summary && <SummaryCard summary={summary} complete={complete} fresh={freshSummary} />}
    </div>
  );
}
