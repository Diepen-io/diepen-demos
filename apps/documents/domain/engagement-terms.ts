import type { CompanyProfile } from "@diepen/voice/profile";

/** The service the engagement letter names: the one that best matches a tax return, else the first. */
export function engagementService(profile: CompanyProfile): { name: string; price?: string } {
  const services = profile.knowledge.services;
  const match = services.find((service) => /tax return/i.test(service.name)) ?? services[0];
  return match ? { name: match.name, price: match.price } : { name: "Income tax return 2025" };
}
