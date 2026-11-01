import type { CompanyProfile } from "@diepen/voice/profile";

export type ProposalService = { name: string; description: string; price: string };

/** What a proposal says when the profile lists no price. */
export const priceOnRequest = "Price on request";

/** The service a proposal offers: the first one with a price, quoted verbatim. */
export function proposalService(profile: CompanyProfile): ProposalService {
  const { services } = profile.knowledge;
  const priced = services.find((service) => service.price);
  if (priced?.price) return { name: priced.name, description: priced.description, price: priced.price };
  const first = services[0];
  return {
    name: first?.name ?? profile.industry,
    description: first?.description ?? profile.tagline,
    price: priceOnRequest,
  };
}

/** The currency a price is quoted in, for example "EUR" in "EUR 34 per unit per month", or `null`. */
export function currencyOf(price: string): string | null {
  return /\b(EUR|USD|GBP|CHF|AUD|CAD)\b|[€$£]/.exec(price)?.[0] ?? null;
}
