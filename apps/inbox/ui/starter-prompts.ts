import type { CompanyProfile } from "@diepen/voice/profile";
import { fillTemplate } from "@/domain/message-template";

/** The first messages a visitor can send with one click: a price, a booking and a handover. */
export function starterPrompts(profile: CompanyProfile): string[] {
  const hasService = profile.knowledge.services.length > 0;
  return [
    hasService ? fillTemplate("How much is {aServiceA}?", profile) : "What are your prices?",
    "Can I book a time this week?",
    "I'm not happy with how it went and I'd like a refund.",
  ];
}
