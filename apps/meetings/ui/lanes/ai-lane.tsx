import { cx } from "@diepen/ui/primitives/class-names";
import { Icon } from "@diepen/ui/primitives/icon";
import type { MeetingOutputs } from "@/domain/meeting-outputs";

export type AiLaneProps = {
  status: "waiting" | "reading" | "done";
  /** What the AI waits for, for example the end of the call. */
  waitingFor: string;
  turns?: number;
  /** Seconds the visitor has waited, in live mode. */
  seconds?: number;
  summary?: { text: string; isNew: boolean };
  insights?: { numbers: MeetingOutputs["numbers"]; painPoints: string[]; isNew: boolean };
};

/** The AI's notes on the call: summary, the prospect's numbers and pain points. */
export function AiLane({ status, waitingFor, turns, seconds, summary, insights }: AiLaneProps) {
  return (
    <div data-lane="ai" className="flex flex-col gap-3">
      {status === "waiting" ? (
        <p className="flex items-center gap-2.5 px-1 py-2 text-body text-faint 2xl:text-body">
          <Icon name="clock" size={17} className="shrink-0" />
          {waitingFor}
        </p>
      ) : (
        <ReadingRow turns={turns ?? 0} seconds={seconds} done={status === "done"} />
      )}
      {summary && (
        <section data-output="summary" className={cx("rounded-xl bg-surface px-3.5 py-3 shadow-[inset_0_0_0_1px_var(--border)]", summary.isNew && "enter")}>
          <h3 className="mb-1.5 text-meta font-semibold text-muted">Summary</h3>
          <p className="text-body leading-[1.5] 2xl:text-body">{summary.text}</p>
        </section>
      )}
      {insights && (
        <section data-output="numbers" className={cx("flex flex-col gap-3", insights.isNew && "enter")}>
          <h3 className="sr-only">Numbers and pain points</h3>
          <ul className="grid grid-cols-2 gap-1.5">
            {insights.numbers.map((figure) => (
              <li key={`${figure.label}-${figure.value}`} className="rounded-lg bg-brand-soft px-3 py-2">
                <span className="tabular block text-title leading-tight font-semibold tracking-[-0.02em] 2xl:text-heading">{figure.value}</span>
                <span className="block text-caption leading-snug text-muted 2xl:text-meta">{figure.label}</span>
              </li>
            ))}
          </ul>
          <ul className="flex flex-col gap-2">
            {insights.painPoints.map((point) => (
              <li key={point} className="flex gap-2.5 text-body leading-snug 2xl:text-body">
                <Icon name="alert" size={16} className="mt-0.5 shrink-0 text-wait" />
                {point}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function ReadingRow({ turns, seconds, done }: { turns: number; seconds?: number; done: boolean }) {
  return (
    <div
      className="relative flex items-center gap-2.5 overflow-hidden rounded-xl bg-subtle px-3.5 py-3 text-body 2xl:text-body"
      role={done ? undefined : "status"}
    >
      <span className={cx("grid size-6 shrink-0 place-items-center rounded-full", done ? "bg-brand text-brand-foreground" : "bg-surface")}>
        <Icon name={done ? "check" : "sparkle"} size={14} className={done ? undefined : "animate-pulse text-brand"} />
      </span>
      <span className="min-w-0 flex-1 font-medium">{done ? `Read ${turns} turns` : `Reading ${turns} turns`}</span>
      {seconds !== undefined && !done && <span className="tabular text-muted">{seconds} s</span>}
      {!done && (
        <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden">
          <span className="reading-sweep block h-full w-2/5 rounded-full bg-brand" />
        </span>
      )}
    </div>
  );
}
