import type { CheckResult } from "@/domain/check-result";
import { capitalised } from "@/domain/plain-words";
import { Badge, StatusBadge } from "@diepen/ui/primitives/badge";
import { cx } from "@diepen/ui/primitives/class-names";
import { Icon } from "@diepen/ui/primitives/icon";
import { FileIcon, fileKindOf } from "@diepen/ui/mockups/file-icon";
import { MiddleTruncate } from "./middle-truncate";

export type CheckPhase = "queued" | "reading" | "done" | "aborted";

export type CheckCardModel = {
  id: string;
  fileName: string;
  phase: CheckPhase;
  result?: CheckResult;
  /** One figure only, for a batch of passing files. */
  compact?: boolean;
  /** A later upload of the same item passed, so this card shrinks to its file name. */
  replaced?: boolean;
  fresh?: boolean;
};

/** "Daniel Okafor, 2025, 1 page, signed", or "No name or year found, 1 page". */
function facts(result: CheckResult): string {
  const who = result.person === null && result.year === null
    ? ["no name or year found"]
    : [result.person ?? "no name found", result.year === null ? "no year found" : String(result.year)];
  const parts = [...who];
  if (result.pageCount !== undefined) parts.push(`${result.pageCount} ${result.pageCount === 1 ? "page" : "pages"}`);
  if (result.signed !== undefined) parts.push(result.signed ? "signed" : "not signed");
  return capitalised(parts.join(", "));
}

function PhaseBadge({ phase, result, replaced }: Pick<CheckCardModel, "phase" | "result" | "replaced">) {
  if (replaced) return <Badge tone="neutral" icon="folder">Replaced</Badge>;
  if (phase === "done" && result) return <StatusBadge status={result.status === "ok" ? "checked" : "problem"} />;
  if (phase === "reading") return <Badge tone="info" icon="search">Reading</Badge>;
  if (phase === "aborted") return <Badge tone="wait" icon="alert">Not finished</Badge>;
  return <Badge tone="neutral" icon="clock">Queued</Badge>;
}

/** One uploaded file in the system lane: queued, being read, then what the check found. */
export function CheckCard({ fileName, phase, result, compact, replaced, fresh }: CheckCardModel) {
  const done = phase === "done" && result && !replaced;
  const problem = done && result.status === "problem";
  return (
    <article
      className={cx(
        "flex shrink-0 flex-col gap-3 rounded-xl bg-surface p-3.5 shadow-[inset_0_0_0_1px_var(--border)] transition-shadow duration-500",
        problem && "shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--fail)_30%,white)]",
        fresh && "enter",
      )}
    >
      <header className="flex flex-wrap items-center justify-end gap-x-2.5 gap-y-1.5">
        <span className="flex min-w-[11rem] flex-1 items-center gap-2.5">
          <FileIcon kind={fileKindOf(fileName)} size={24} />
          <MiddleTruncate text={fileName} className="flex-1 text-body font-medium" />
        </span>
        <PhaseBadge phase={phase} result={result} replaced={replaced} />
      </header>

      {phase === "reading" && (
        <div aria-hidden="true" className="h-1 overflow-hidden rounded-full bg-info-soft">
          <div className="reading-bar h-full w-1/3 rounded-full bg-info" />
        </div>
      )}
      {phase === "aborted" && <p className="text-meta text-muted">The check did not finish. Upload the file again.</p>}

      {done && (
        <div className="flex flex-col gap-2.5">
          {!compact && (
            <div>
              <p className="text-body font-semibold">{result.documentType}</p>
              <p className="text-meta text-muted">{facts(result)}</p>
            </div>
          )}
          {result.keyFigures.length > 0 && (
            <dl className="grid gap-1">
              {result.keyFigures.slice(0, compact ? 1 : 3).map((figure) => (
                <div key={figure.label} className="flex items-baseline justify-between gap-3 text-body">
                  <dt className="text-muted">{figure.label}</dt>
                  <dd className="tabular text-right font-medium">{figure.value}</dd>
                </div>
              ))}
            </dl>
          )}
          {result.issues.map((issue) => (
            <p key={issue.kind} className="flex gap-2 rounded-lg bg-fail-soft px-2.5 py-2 text-body leading-snug text-fail">
              <Icon name="alert" size={15} className="mt-0.5 shrink-0" />
              {issue.detail}
            </p>
          ))}
          {!compact && result.status === "ok" && <p className="line-clamp-2 text-meta text-muted">{result.summary}</p>}
        </div>
      )}
    </article>
  );
}
