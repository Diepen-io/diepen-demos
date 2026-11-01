import type { CompanyProfile } from "@diepen/voice/profile";
import { fillTemplate } from "@/domain/message-template";

/** The first messages a visitor can send with one click: a price, a booking and a handover. */
export function starterPrompts(profile: CompanyProfile): string[] {
  return [
    fillTemplate("How much is {aServiceA}?", profile),
    "Can I book a time this week?",
    "I'd like a refund for my last visit.",
  ];
}
