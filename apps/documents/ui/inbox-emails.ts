import { requestEmail, type ComposedMessage } from "@/domain/chase-emails";
import { itemIds } from "@/domain/document-request";
import type { CompanyProfile } from "@diepen/voice/profile";
import type { InboxEmail } from "./email-views";
import { uploadHost } from "./upload-page";

/** Who the client's emails come from: the firm's assistant, at the firm's address. */
export function emailSender(profile: CompanyProfile): InboxEmail["from"] {
  return { name: profile.people.assistantName, email: profile.knowledge.contactEmail || `hello@${uploadHost(profile)}` };
}

export function inboxEmail(
  profile: CompanyProfile,
  kind: InboxEmail["kind"],
  message: ComposedMessage,
  extra: Pick<InboxEmail, "id" | "time" | "unread"> & { fresh?: boolean },
): InboxEmail {
  return { kind, from: emailSender(profile), subject: message.subject, body: message.body, ...extra };
}

/** The first email: all six items, as the firm sends it. */
export function requestMessage(profile: CompanyProfile): ComposedMessage {
  return requestEmail(profile, itemIds.map((itemId) => ({ itemId, reason: "Not received yet." })));
}
