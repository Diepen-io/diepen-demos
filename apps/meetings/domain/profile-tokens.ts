import type { CompanyProfile } from "@diepen/voice/profile";
import { firstName } from "./call-sides";
import { proposalService } from "./proposal-service";

/**
 * Fixtures and captions name the seller through tokens such as `{sellerCompany}`, so the film
 * stays true for every company profile.
 */
export type ProfileTokens = {
  sellerCompany: string;
  sellerOwner: string;
  sellerOwnerFirst: string;
  sellerEmail: string;
  serviceName: string;
  servicePrice: string;
  signOff: string;
  /** The first line of the sign-off, for an email the owner signs with their own name. */
  signOffGreeting: string;
  bookingMinutes: string;
};

export function profileTokens(profile: CompanyProfile): ProfileTokens {
  const service = proposalService(profile);
  const signOff = profile.voice.signOff;
  return {
    sellerCompany: profile.name,
    sellerOwner: profile.people.owner.name,
    sellerOwnerFirst: firstName(profile.people.owner.name),
    sellerEmail: profile.knowledge.contactEmail,
    serviceName: service.name,
    servicePrice: service.price,
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
