import type { CompanyProfile } from "@diepen/voice/profile";
import { firstName, isPersonName, speakerLabel } from "./person-name";

/**
 * How the screen names the seller. A profile's owner can be a person ("Dr. Lena Okafor") or, when
 * a website names nobody, a group ("the team"); every sentence reads well for both.
 */
export type Seller = {
  company: string;
  /** The owner's full name, or null when the profile names no person. */
  person: string | null;
  /** For the recorder's toggle and its transcript lines: "Lena", or "You" without a person. */
  short: string;
  /** The seller's label in the sample call: the owner, else the company, fitted to a speaker label. */
  speaker: string;
  /** How the seller opens a call: "Lena from Okafor Dental", or "the team at Okafor Dental". */
  intro: string;
  /** Who a sentence names: "Dr. Lena Okafor of Okafor Dental", or "Okafor Dental". */
  described: string;
  /** The name under an email: "Dr. Lena Okafor", or "The Okafor Dental team". */
  signature: string;
};

/** The seller's side in a recording when the profile names no person. */
const youLabel = "You";

export function sellerOf(profile: CompanyProfile): Seller {
  const company = profile.name.trim();
  const owner = profile.people.owner.name.trim();
  if (isPersonName(owner)) {
    const first = firstName(owner);
    return {
      company,
      person: owner,
      short: speakerLabel(first, youLabel),
      speaker: speakerLabel(owner, speakerLabel(first, youLabel)),
      intro: `${first} from ${company}`,
      described: `${owner} of ${company}`,
      signature: owner,
    };
  }
  return {
    company,
    person: null,
    short: youLabel,
    speaker: speakerLabel(company, youLabel),
    intro: `the team at ${company}`,
    described: company,
    signature: /^the\s/i.test(company) ? `${company} team` : `The ${company} team`,
  };
}

/** Speaker labels that mean the seller, lower case, for telling the two sides of a call apart. */
export function sellerLabels(seller: Seller): string[] {
  return [seller.speaker, seller.short, ...(seller.person ? [firstName(seller.person)] : [])].map((label) => label.toLowerCase());
}
