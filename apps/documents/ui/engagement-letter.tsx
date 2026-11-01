import { engagementContact, engagementService } from "@/domain/engagement-terms";
import { BrandMark } from "@diepen/ui/brand/brand-mark";
import type { CompanyProfile } from "@diepen/voice/profile";
import type { ReactNode } from "react";

export type LetterSignature =
  | {
      kind: "drawn";
      /** 0 to 1, how much of the stroke is on the page. */
      progress: number;
      /** A stroke from the signature pad, in its 640 by 220 box. Without it a stock signature shows. */
      path?: string;
    }
  | { kind: "typed"; name: string };

export type EngagementLetterProps = {
  profile: CompanyProfile;
  signature?: LetterSignature;
  /** The signing controls in live mode, under the letter. */
  children?: ReactNode;
};

/** Daniel's handwriting as one stroke, for a drawn signature without its own path. */
const danielSignature =
  "M6 40 C12 10 22 6 20 30 C19 44 10 46 14 34 C20 18 34 14 30 32 M38 36 C42 24 48 24 46 36 C52 24 56 26 58 34 M64 34 C70 18 80 16 76 30 C72 42 86 40 92 28 C96 20 100 34 108 30 C116 26 120 18 132 22";

function Signature({ signature }: { signature: LetterSignature }) {
  if (signature.kind === "typed") {
    return <span className="text-[26px] leading-none font-medium tracking-[-0.02em] text-foreground italic">{signature.name}</span>;
  }
  const own = signature.path;
  return (
    <svg viewBox={own ? "0 0 640 220" : "0 0 140 50"} className="h-12 w-auto" aria-label="Daniel Okafor's signature" role="img">
      <path
        d={own ?? danielSignature}
        fill="none"
        stroke="var(--foreground)"
        strokeWidth={own ? 7 : 2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray="1 1"
        strokeDashoffset={1 - Math.min(Math.max(signature.progress, 0), 1)}
      />
    </svg>
  );
}

/** The letter Daniel signs on the upload page, written from the firm's profile. */
export function EngagementLetter({ profile, signature, children }: EngagementLetterProps) {
  const service = engagementService(profile);
  return (
    <article aria-label="Engagement letter" className="flex flex-col gap-4 text-[14px] leading-relaxed">
      <header className="flex items-center gap-2.5">
        <BrandMark profile={profile} size={30} />
        <span className="min-w-0 text-[14px] leading-snug font-semibold text-balance">{profile.name}</span>
      </header>
      <div>
        <h3 className="text-[19px] leading-tight font-semibold tracking-[-0.015em]">Engagement letter</h3>
        <p className="text-meta text-muted">Tax return 2025 for Daniel Okafor</p>
      </div>
      <p>
        {profile.name} prepares and files your 2025 income tax return. You send the documents on your checklist; we check each
        one and tell you at once if something is missing.
      </p>
      <dl className="grid gap-1.5 rounded-lg bg-subtle p-3 text-[13px]">
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Service</dt>
          <dd className="text-right font-medium">{service.name}</dd>
        </div>
        {service.price && (
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Fee</dt>
            <dd className="tabular text-right font-medium">{service.price}</dd>
          </div>
        )}
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Your contact</dt>
          <dd className="text-right font-medium">{engagementContact(profile.people.owner)}</dd>
        </div>
      </dl>
      <div>
        <div className="flex h-14 items-end border-b border-foreground/40 pb-1">{signature && <Signature signature={signature} />}</div>
        <p className="mt-1 text-meta text-muted">Daniel Okafor, client</p>
      </div>
      {children}
    </article>
  );
}
