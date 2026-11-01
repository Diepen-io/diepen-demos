import type { CompanyProfile } from "@diepen/voice/profile";
import { priceOnRequest, proposalService } from "./proposal-service";
import { sellerOf } from "./seller";

/**
 * Fixtures name the seller through tokens such as `{sellerCompany}`, so the sample call reads
 * well for every company profile, whether its owner is a person or a team.
 */
export type ProfileTokens = {
  sellerCompany: string;
  /** The seller's speaker label: the owner's name, or the company when the profile names no person. */
  sellerOwner: string;
  /** The owner's first name without a title, or "You" when the profile names no person. */
  sellerOwnerFirst: string;
  /** How the seller opens the call: "Jonas from Brickfern", "the team at Brickfern". */
  sellerIntro: string;
  /** The name under an email the owner signs. */
  sellerSignature: string;
  sellerEmail: string;
  serviceName: string;
  servicePrice: string;
  /** The sentence that names the price, with its own wording when the profile lists none. */
  servicePriceLine: string;
  signOff: string;
  /** The first line of the sign-off, for an email the owner signs with their own name. */
  signOffGreeting: string;
  bookingMinutes: string;
};

export function profileTokens(profile: CompanyProfile): ProfileTokens {
  const service = proposalService(profile);
  const seller = sellerOf(profile);
  const signOff = profile.voice.signOff;
  return {
    sellerCompany: seller.company,
    sellerOwner: seller.speaker,
    sellerOwnerFirst: seller.short,
    sellerIntro: seller.intro,
    sellerSignature: seller.signature,
    sellerEmail: profile.knowledge.contactEmail,
    serviceName: service.name,
    servicePrice: service.price,
    servicePriceLine:
      service.price === priceOnRequest
        ? `I'll work out the price for ${service.name} from your numbers.`
        : `${service.name} is ${service.price}.`,
    signOff,
    signOffGreeting: signOff.split("\n")[0]?.trim() || "Best regards,",
    bookingMinutes: String(profile.knowledge.bookingMinutes),
  };
}

function isToken(name: string, tokens: ProfileTokens): name is keyof ProfileTokens {
  return Object.hasOwn(tokens, name);
}

/** Fills every `{token}` in the text. An unknown token throws, so a typo in a fixture fails loudly. */
export function fillTokens(text: string, tokens: ProfileTokens): string {
  return text.replace(/\{(\w+)\}/g, (_, name: string) => {
    if (!isToken(name, tokens)) throw new Error(`Unknown token {${name}}`);
    return tokens[name];
  });
}
