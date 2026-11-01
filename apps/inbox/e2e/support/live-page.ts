import type { InboxReply } from "@diepen/voice/tasks/inbox-reply";
import type { Locator, Page, Request, Response } from "@playwright/test";
import { gotoApp, isNarrow } from "./layout";

/** The visitor's clock in every live flow, so the free slots are the same on every run. */
export const liveNow = new Date("2026-11-10T21:42:00");

export type ReplyBody = { reply: InboxReply; provider: "claude" | "mock"; replyMs: number };

export type LivePart = "Customer" | "Owner view" | "Calendar";

export type LiveChannel = { id: "email" | "instagram" | "linkedin" | "chat"; label: string };

export const liveChannels: readonly LiveChannel[] = [
  { id: "email", label: "Email" },
  { id: "instagram", label: "Instagram" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "chat", label: "Website chat" },
];

export async function openLive(page: Page, path = "/live"): Promise<void> {
  await page.clock.install({ time: liveNow });
  await gotoApp(page, path);
}

export function isReplyRequest(request: Request): boolean {
  return request.method() === "POST" && new URL(request.url()).pathname === "/api/reply";
}

const isReplyResponse = (response: Response) => isReplyRequest(response.request());

/** Below 768 px live mode shows one part at a time behind a bottom tab bar. Wider, all parts show. */
export async function showLivePart(page: Page, part: LivePart): Promise<void> {
  if (!isNarrow(page)) return;
  await page.getByRole("tab", { name: new RegExp(`^${part}`) }).click();
}

export async function openChannel(page: Page, label: string): Promise<void> {
  await showLivePart(page, "Customer");
  await page.getByRole("tablist", { name: "Channels" }).getByRole("tab", { name: new RegExp(`^${label}`) }).click();
}

/** Types into the active channel's composer, sends, and returns the body `/api/reply` answered with. */
export async function sendMessage(page: Page, text: string): Promise<ReplyBody> {
  await page.getByRole("textbox", { name: "Message" }).fill(text);
  const [response] = await Promise.all([
    page.waitForResponse(isReplyResponse),
    page.getByRole("button", { name: "Send", exact: true }).click(),
  ]);
  return (await response.json()) as ReplyBody;
}

/** Waits for the reply that a click (a slot chip, a starter) sends. */
export async function replyAfter(page: Page, action: () => Promise<void>): Promise<ReplyBody> {
  const [response] = await Promise.all([page.waitForResponse(isReplyResponse), action()]);
  return (await response.json()) as ReplyBody;
}

export function liveOwnerView(page: Page): Locator {
  return page.getByRole("region", { name: "Owner view" });
}

export function ownerRow(scope: Page | Locator, channel: LiveChannel["id"]): Locator {
  return scope.locator(`[data-testid="owner-row"][data-channel="${channel}"]`);
}
