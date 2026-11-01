import { followUpEmail, reminderEmail, requestEmail, type ComposedMessage, type OutstandingEntry } from "@/domain/chase-emails";
import { itemIds } from "@/domain/document-request";
import { formatWeekdayTime } from "@/domain/story-time";
import type { CompanyProfile } from "@diepen/voice/profile";
import type { InboxEmail } from "./email-views";
import { uploadHost } from "./upload-page";

/**
 * The client's emails are kept as facts (which email, when, what was outstanding) and written
 * with the active profile on every render, so a profile applied later changes every open email.
 */

export type EmailRecord = {
  id: string;
  kind: InboxEmail["kind"];
  /** Story time, "2026-03-09T09:00". */
  sentAt: string;
  /** The items a follow-up or reminder lists. The request always lists all six. */
  outstanding: OutstandingEntry[];
  /** Whether the client had sent any file when a follow-up went out. */
  anyFileReceived: boolean;
  unread: boolean;
  fresh?: boolean;
};

/** Who the client's emails come from: the firm's assistant, at the firm's address. */
export function emailSender(profile: CompanyProfile): InboxEmail["from"] {
  return { name: profile.people.assistantName, email: profile.knowledge.contactEmail || `hello@${uploadHost(profile)}` };
}

/** The first email: all six items, as the firm sends it. */
export function requestMessage(profile: CompanyProfile): ComposedMessage {
  return requestEmail(profile, itemIds.map((itemId) => ({ itemId, reason: "Not received yet." })));
}

function messageOf(profile: CompanyProfile, record: EmailRecord): ComposedMessage {
  if (record.kind === "request") return requestMessage(profile);
  if (record.kind === "follow-up") return followUpEmail(profile, record.outstanding, record.anyFileReceived);
  return reminderEmail(profile, record.outstanding);
}

export function composeInboxEmail(profile: CompanyProfile, record: EmailRecord): InboxEmail {
  const { subject, body } = messageOf(profile, record);
  return {
    id: record.id,
    kind: record.kind,
    from: emailSender(profile),
    subject,
    body,
    time: formatWeekdayTime(record.sentAt),
    unread: record.unread,
    fresh: record.fresh,
  };
}
