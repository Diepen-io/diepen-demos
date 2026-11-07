import { BrandMark } from "@diepen/ui/brand/brand-mark";
import { Badge } from "@diepen/ui/primitives/badge";
import { cx } from "@diepen/ui/primitives/class-names";
import { Icon } from "@diepen/ui/primitives/icon";
import type { CompanyProfile } from "@diepen/voice/profile";
import type { MeetingOutputs } from "@/domain/meeting-outputs";

export type ProposalPaperProps = {
  seller: Pick<CompanyProfile, "name" | "logo" | "colors">;
  proposal: MeetingOutputs["proposal"];
  /** Who it is for, for example "Tom Becker, Becker Residential". Empty when the call named nobody. */
  client: string;
  date: string;
  sent: boolean;
  isNew: boolean;
};

function Status({ sent }: { sent: boolean }) {
  return sent ? (
    <Badge tone="pass" icon="check">
      Sent
    </Badge>
  ) : (
    <Badge tone="neutral">Draft</Badge>
  );
}

/** The proposal as a page in the seller's colours: scope, price, timeline and terms. */
export function ProposalPaper({ seller, proposal, client, date, sent, isNew }: ProposalPaperProps) {
  return (
    <article
      data-output="proposal"
      className={cx(
        "flex flex-col gap-4 overflow-hidden rounded-xl bg-surface px-4 pb-4 shadow-[0_0_0_1px_var(--border),0_8px_24px_-14px_rgb(0_0_0/0.25)] 2xl:px-5",
        isNew && "enter",
      )}
    >
      <div className="-mx-4 h-1.5 bg-brand 2xl:-mx-5" />
      <header className="flex flex-col gap-2.5">
        <div className="flex items-start gap-2.5">
          <BrandMark profile={seller} size={26} />
          <span className="min-w-0 flex-1 pt-1 text-meta leading-snug font-semibold">{seller.name}</span>
          <Status sent={sent} />
        </div>
        <h3 className="text-heading leading-tight font-semibold tracking-[-0.02em] 2xl:text-heading">
          {proposal.title}
        </h3>
        <p className="text-meta text-muted">
          {client ? <>For {client}, </> : null}
          <span className="whitespace-nowrap">{date}</span>
        </p>
      </header>
      <ul className="flex flex-col gap-2">
        {proposal.scope.map((item) => (
          <li key={item} className="flex gap-2.5 text-body leading-snug 2xl:text-body">
            <Icon name="check" size={16} strokeWidth={2.25} className="mt-0.5 shrink-0 text-brand" />
            {item}
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 rounded-xl bg-brand-soft px-3.5 py-3">
        <span className="text-meta font-semibold text-muted">Price</span>
        <span className="tabular text-title font-semibold tracking-[-0.015em] 2xl:text-heading">
          {proposal.price}
        </span>
      </div>
      <dl className="grid gap-1.5 text-meta leading-snug 2xl:text-body">
        <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-2">
          <dt className="text-faint">Timeline</dt>
          <dd>{proposal.timeline}</dd>
        </div>
        <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-2">
          <dt className="text-faint">Terms</dt>
          <dd>{proposal.terms}</dd>
        </div>
      </dl>
    </article>
  );
}
