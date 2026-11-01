import type { CompanyProfile } from "@diepen/voice/profile";
import { capitalised } from "./plain-words";

/** The service the engagement letter names: the one that best matches a tax return, else the first. */
export function engagementService(profile: CompanyProfile): { name: string; price?: string } {
  const services = profile.knowledge.services;
  const match = services.find((service) => /tax return/i.test(service.name)) ?? services[0];
  return match ? { name: match.name, price: match.price } : { name: "Income tax return 2025" };
}

/**
 * Who the client talks to, as the letter names it: "Sabine Roth, Tax adviser and partner". A role
 * that only repeats the name, as in a drafted profile's "The owner, Owner", is left out.
 */
export function engagementContact(owner: CompanyProfile["people"]["owner"]): string {
  const name = capitalised(owner.name.trim());
  const role = owner.role.trim();
  const repeats = !role || name.toLowerCase().includes(role.toLowerCase()) || role.toLowerCase().includes(name.toLowerCase());
  return repeats ? name : `${name}, ${role}`;
}
