import type { CompanyProfile } from "@diepen/voice/profile";
import type { CSSProperties, ReactNode } from "react";
import { BrandMark } from "../brand/brand-mark";
import { Badge } from "../primitives/badge";
import { cx } from "../primitives/class-names";
import { Icon } from "../primitives/icon";
import { ChannelFrame } from "./channel-frame";

export type ProposalDocumentProps = {
  company: Pick<CompanyProfile, "name" | "logo" | "colors">;
  title: string;
  client: { name: string; company?: string };
  /** As it should read, for example "11 November 2026". */
  date: string;
  scope: { item: string; detail?: string }[];
  price: { total: string; note?: string; lines?: { label: string; amount: string }[] };
  timeline: { step: string; when: string }[];
  terms: string[];
  /** Name and role under the proposal, for example "Dr. Lena Okafor, Practice owner". */
  preparedBy?: string;
  state?: "draft" | "sent";
  /** Plays the entrance section by section, as the proposal is written. */
  isNew?: boolean;
  className?: string;
};

function Section({ title, index, animate, children }: { title: string; index: number; animate?: boolean; children: ReactNode }) {
  return (
    <section className={cx("flex flex-col gap-2.5", animate && "enter")} style={animate ? { animationDelay: `${index * 140}ms` } : undefined}>
      <h4 className="text-meta font-semibold tracking-[0.04em] text-muted uppercase">{title}</h4>
      {children}
    </section>
  );
}

/** A proposal page in the company's colours: scope, price, timeline and terms. */
export function ProposalDocument(props: ProposalDocumentProps) {
  const { company, title, client, date, scope, price, timeline, terms, preparedBy, state, isNew, className } = props;
  const brand = { "--brand": company.colors.brand, "--brand-foreground": company.colors.brandForeground } as CSSProperties;
  const meta = state && (state === "sent" ? <Badge tone="pass" icon="check">Sent</Badge> : <Badge tone="neutral">Draft</Badge>);

  return (
    <ChannelFrame channel="Proposal" icon="file" accent="var(--foreground)" meta={meta} className={className}>
      <div data-brand-scope="" style={brand} className="scroll-area min-h-0 flex-1 overflow-y-auto bg-subtle p-3 @lg:p-5">
        <article className="mx-auto flex max-w-[44rem] flex-col gap-6 overflow-hidden rounded-xl bg-surface px-5 pt-0 pb-6 shadow-[0_0_0_1px_var(--border),0_8px_24px_-12px_rgb(0_0_0/0.15)] @lg:px-8">
          <div className="-mx-5 h-1.5 bg-brand @lg:-mx-8" />
          <header className="flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <BrandMark profile={company} size={30} />
              <span className="text-[15px] font-semibold">{company.name}</span>
            </div>
            <h3 className="text-[24px] leading-tight font-semibold tracking-[-0.02em] @lg:text-[28px]">{title}</h3>
            <dl className="flex flex-wrap gap-x-6 gap-y-1 text-meta">
              <div className="flex gap-1.5">
                <dt className="text-muted">For</dt>
                <dd className="font-medium">{client.company ? `${client.name}, ${client.company}` : client.name}</dd>
              </div>
              <div className="flex gap-1.5">
                <dt className="text-muted">Date</dt>
                <dd className="tabular font-medium">{date}</dd>
              </div>
            </dl>
          </header>

          <Section title="Scope" index={0} animate={isNew}>
            <ul className="flex flex-col gap-2">
              {scope.map((entry) => (
                <li key={entry.item} className="flex gap-2.5 text-body">
                  <Icon name="check" size={17} strokeWidth={2.25} className="mt-0.5 shrink-0 text-brand" />
                  <span>
                    <span className="font-medium text-foreground">{entry.item}</span>
                    {entry.detail && <span className="text-muted">. {entry.detail}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Price" index={1} animate={isNew}>
            <div className="flex flex-col gap-2 rounded-xl bg-brand-soft px-4 py-3.5">
              {price.lines?.map((line) => (
                <div key={line.label} className="flex justify-between gap-4 text-body">
                  <span className="text-muted">{line.label}</span>
                  <span className="tabular">{line.amount}</span>
                </div>
              ))}
              <div className={cx("flex items-baseline justify-between gap-4", Boolean(price.lines?.length) && "border-t border-brand-line pt-2")}>
                <span className="text-body font-semibold">Total</span>
                <span className="tabular text-2xl font-semibold tracking-[-0.02em]">{price.total}</span>
              </div>
              {price.note && <p className="text-meta text-muted">{price.note}</p>}
            </div>
          </Section>

          <Section title="Timeline" index={2} animate={isNew}>
            <ol className="flex flex-col">
              {timeline.map((entry, index) => (
                <li key={entry.step} className="flex gap-3">
                  <span className="flex flex-col items-center">
                    <span className="mt-1.5 size-2.5 rounded-full bg-brand" />
                    {index < timeline.length - 1 && <span className="w-px flex-1 bg-brand-line" />}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-wrap justify-between gap-x-4 pb-3 text-body">
                    <span className="font-medium">{entry.step}</span>
                    <span className="tabular text-muted">{entry.when}</span>
                  </span>
                </li>
              ))}
            </ol>
          </Section>

          <Section title="Terms" index={3} animate={isNew}>
            <ul className="flex list-disc flex-col gap-1 pl-5 text-body text-muted marker:text-faint">
              {terms.map((term) => (
                <li key={term}>{term}</li>
              ))}
            </ul>
          </Section>

          {preparedBy && <p className="border-t border-border pt-4 text-meta text-muted">Prepared by {preparedBy}</p>}
        </article>
      </div>
    </ChannelFrame>
  );
}
