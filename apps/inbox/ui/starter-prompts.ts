import type { CompanyProfile } from "@diepen/voice/profile";
import { fillTemplate } from "@/domain/message-template";

/** The booking question, also sent by the live guide. */
export const askTimeText = "Can I book a time this week?";
/** The refund question, which the assistant hands to a person. Also sent by the live guide. */
export const askRefundText = "I'm not happy with how it went and I'd like a refund.";

/** The first messages a visitor can send with one click: a price, a booking and a handover. */
export function starterPrompts(profile: CompanyProfile): string[] {
  const hasService = profile.knowledge.services.length > 0;
  return [
    // "your" reads right for any service name, where "a" would give "a full rental management".
    hasService ? fillTemplate("What does your {serviceA} cost?", profile) : "What are your prices?",
    askTimeText,
    askRefundText,
  ];
}
