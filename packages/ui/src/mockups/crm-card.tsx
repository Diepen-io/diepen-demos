import { Avatar } from "../primitives/avatar";
import { cx } from "../primitives/class-names";
import { Icon } from "../primitives/icon";
import { ChannelFrame } from "./channel-frame";

export type CrmField = { label: string; value: string; isNew?: boolean };

export type CrmCardProps = {
  company: string;
  contact: { name: string; role?: string; email?: string };
  /** Deal value as it should read, for example "€4,800". */
  value: string;
  stages: string[];
  stage: string;
  fields: CrmField[];
  nextStep?: { label: string; due: string };
  note?: string;
  updated?: string;
  className?: string;
};

/** One deal record. Fields marked new light up as the AI fills them in; a new stage fills its bar and re-enters its chip. */
export function CrmCard({ company, contact, value, stages, stage, fields, nextStep, note, updated, className }: CrmCardProps) {
  const current = stages.indexOf(stage);
  return (
    <ChannelFrame channel="CRM" icon="briefcase" accent="var(--channel-crm)" meta={updated} className={className}>
      <div className="scroll-area flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-4 @lg:p-5 [&>*]:shrink-0">
        <header className="flex flex-wrap items-start gap-x-4 gap-y-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-subtle text-muted shadow-[inset_0_0_0_1px_var(--border)]">
              <Icon name="briefcase" size={20} />
            </span>
            <div className="min-w-0">
              <h3 className="line-clamp-2 text-lg leading-tight font-semibold tracking-[-0.01em]">{company}</h3>
              <p className="flex min-w-0 items-center gap-1.5 text-meta text-muted">
                <Avatar name={contact.name} size={18} />
                <span className="truncate">
                  {contact.name}
                  {contact.role && `, ${contact.role}`}
                </span>
              </p>
            </div>
          </div>
          <div className="text-right">
            <p key={stage} className="enter mb-1 inline-flex h-6 items-center rounded-full bg-brand px-2.5 text-[12px] font-semibold text-brand-foreground">
              {stage}
            </p>
            <p className="text-meta text-muted">Deal value</p>
            <p className="tabular text-2xl font-semibold tracking-[-0.02em]">{value}</p>
          </div>
        </header>

        <ol aria-label="Pipeline stage" className="flex gap-1">
          {stages.map((name, index) => (
            <li key={name} aria-current={index === current ? "step" : undefined} className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="h-1.5 overflow-hidden rounded-full bg-border">
                <span
                  className={cx(
                    "block h-full origin-left rounded-full transition-[transform,background-color] duration-500 ease-[var(--ease-out)]",
                    index < current ? "scale-x-100 bg-foreground" : index === current ? "scale-x-100 bg-brand" : "scale-x-0 bg-brand",
                  )}
                  style={{ transitionDelay: index === current ? "150ms" : "0ms" }}
                />
              </span>
              <span className={cx("truncate text-[12px] @md:text-meta", index === current ? "font-semibold text-foreground" : "text-faint")}>
                {name}
              </span>
            </li>
          ))}
        </ol>

        <dl className="grid grid-cols-1 gap-x-4 gap-y-px overflow-hidden rounded-xl bg-border shadow-[0_0_0_1px_var(--border)] @md:grid-cols-2">
          {contact.email && <FieldCell field={{ label: "Email", value: contact.email }} />}
          {fields.map((field) => (
            <FieldCell key={field.label} field={field} />
          ))}
        </dl>

        {nextStep && (
          <div className="flex items-center gap-3 rounded-xl bg-subtle px-3.5 py-3">
            <Icon name="calendar" size={18} className="shrink-0 text-muted" />
            <span className="min-w-0 flex-1 text-body font-medium">{nextStep.label}</span>
            <span className="tabular shrink-0 text-meta text-muted">{nextStep.due}</span>
          </div>
        )}

        {note && (
          <div className="enter">
            <h4 className="mb-1.5 text-meta font-medium text-muted">Call notes</h4>
            <p className="text-body whitespace-pre-line text-foreground">{note}</p>
          </div>
        )}
      </div>
    </ChannelFrame>
  );
}

function FieldCell({ field }: { field: CrmField }) {
  return (
    <div className={cx("px-3.5 py-2.5", field.isNew ? "enter bg-brand-soft" : "bg-surface")}>
      <dt className="text-meta text-muted">{field.label}</dt>
      <dd className="text-body font-medium break-words text-foreground">{field.value}</dd>
    </div>
  );
}
