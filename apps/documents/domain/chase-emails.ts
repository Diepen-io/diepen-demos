import type { CompanyProfile } from "@diepen/voice/profile";
import { client, requestItem, taxYear, type ItemId } from "./document-request";
import { formatLongDate } from "./story-time";

/**
 * The emails the client gets and the task the firm gets. Fixed templates filled from the profile
 * (decision N1), so the list of documents is exact and a chase costs no tokens.
 */

export type OutstandingEntry = { itemId: ItemId; reason: string };

export type ComposedMessage = { subject: string; body: string };

const dueDate = formatLongDate("2026-03-31");

const documents = (count: number) => `${count} ${count === 1 ? "document" : "documents"}`;

function numberedList(entries: readonly OutstandingEntry[]): string {
  return entries.map((entry, index) => `${index + 1}. ${requestItem(entry.itemId).label}: ${entry.reason}`).join("\n");
}

function letter(profile: CompanyProfile, paragraphs: readonly string[]): string {
  return [`Dear ${client.name},`, ...paragraphs, profile.voice.signOff].join("\n\n");
}

/** The first email. Every item with what the client needs to know about it. */
export function requestEmail(profile: CompanyProfile, entries: readonly OutstandingEntry[]): ComposedMessage {
  const items = entries.map((entry, index) => `${index + 1}. ${requestItem(entry.itemId).label}. ${requestItem(entry.itemId).detail}.`);
  return {
    subject: `Your ${taxYear} tax return: ${documents(entries.length)}`,
    body: letter(profile, [
      `To prepare your ${taxYear} tax return, ${profile.name} needs these ${documents(entries.length)} from you:`,
      items.join("\n"),
      `One page takes all of them, and it works on your phone. Please send everything by ${dueDate}.`,
    ]),
  };
}

export function followUpEmail(profile: CompanyProfile, entries: readonly OutstandingEntry[]): ComposedMessage {
  return {
    subject: `${documents(entries.length)} still needed for your ${taxYear} tax return`,
    body: letter(profile, [
      `Thank you for your documents. ${profile.name} has checked what you sent. These are still needed:`,
      numberedList(entries),
      "Upload them on the same page as before.",
    ]),
  };
}

export function reminderEmail(profile: CompanyProfile, entries: readonly OutstandingEntry[]): ComposedMessage {
  return {
    subject: `Reminder: ${documents(entries.length)} still open`,
    body: letter(profile, [
      `A short reminder from ${profile.name}. These are still open for your ${taxYear} tax return:`,
      numberedList(entries),
      `Please upload them on the same page by ${dueDate}.`,
    ]),
  };
}

/** After two reminders the system stops writing to the client and asks the firm to call. */
export function escalationTask(profile: CompanyProfile, entries: readonly OutstandingEntry[]): ComposedMessage {
  return {
    subject: `Call ${client.name}: ${documents(entries.length)} still open after 2 reminders`,
    body: [`For ${profile.people.owner.name}. Still open:`, numberedList(entries)].join("\n\n"),
  };
}
