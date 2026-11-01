import type { CompanyProfile } from "@diepen/voice/profile";
import type { ReactNode } from "react";
import type { MeetingOutputs } from "@/domain/meeting-outputs";
import { sellerOf } from "@/domain/seller";
import { FollowUpEmail } from "./follow-up-email";
import { ProposalPaper } from "./proposal-paper";

export type ProposalLaneProps = {
  seller: CompanyProfile;
  client: string;
  date: string;
  proposal?: { proposal: MeetingOutputs["proposal"]; isNew: boolean };
  email?: { email: MeetingOutputs["followUpEmail"]; to: string; draftedAt: string; isNew: boolean; action?: ReactNode };
  /** "14:36" once the email went out. */
  sentAt?: string;
  emptyText?: string;
  /**
   * The film's lane is one screen high and never scrolls. Once the email lands the proposal folds
   * to its title and price, so the email, its status and its attachment stay in view.
   */
  fitScreen?: boolean;
};

/** The proposal, and below it the email that carries it: reading both and pressing send is one step. */
export function ProposalLane({ seller, client, date, proposal, email, sentAt, emptyText, fitScreen }: ProposalLaneProps) {
  const sender = sellerOf(seller);
  return (
    <div data-lane="proposal" className="flex flex-col gap-3">
      {proposal ? (
        <ProposalPaper
          seller={seller}
          proposal={proposal.proposal}
          client={client}
          date={date}
          sent={Boolean(sentAt)}
          folded={fitScreen && Boolean(email)}
          fitShortScreens={fitScreen}
          isNew={proposal.isNew}
        />
      ) : emptyText ? (
        <p className="rounded-xl bg-subtle px-3.5 py-3 text-[14px] text-muted">{emptyText}</p>
      ) : null}
      {email ? (
        <FollowUpEmail
          email={email.email}
          from={{ name: sender.person ?? sender.company, email: seller.knowledge.contactEmail }}
          to={email.to}
          draftedAt={email.draftedAt}
          sentAt={sentAt}
          action={email.action}
          compact={fitScreen}
          isNew={email.isNew}
        />
      ) : null}
    </div>
  );
}
