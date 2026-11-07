import type { Locator, Page } from "@playwright/test";
import { expect } from "./documents-test";

/**
 * The four lanes of live mode. Each is a region named "<label>, <role>", as `ui/lane.tsx` names it.
 * Below 768 px one lane shows at a time and the "Parties" tabs, named Firm, Client, System and
 * Drive, switch between them.
 */

export type LaneId = "firm" | "client" | "system" | "drive";

/** The firm lane takes its label from the active profile. */
export type Firm = { name: string };

export const defaultFirm: Firm = { name: "Ledgerwick Tax & Accounting" };

export const tabLabels: Record<LaneId, string> = { firm: "Firm", client: "Client", system: "System", drive: "Drive" };

const fixedLabels: Record<Exclude<LaneId, "firm">, string> = { client: "Daniel Okafor", system: "Document chaser", drive: "Drive" };

export function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Finds a lane by its party. The role line after the comma is copy, so the match leaves it out. */
export function lane(page: Page, id: LaneId, firm: Firm = defaultFirm): Locator {
  const label = id === "firm" ? firm.name : fixedLabels[id];
  return page.getByRole("region", { name: new RegExp(`^${escapeRegExp(label)}, `) });
}

export function laneTabs(page: Page): Locator {
  return page.getByRole("tablist", { name: "Parties" });
}

/** Brings the lane into view on a phone and returns it. On a wide screen every lane is already there. */
export async function showLane(page: Page, id: LaneId, firm: Firm = defaultFirm): Promise<Locator> {
  const tabs = laneTabs(page);
  if (await tabs.isVisible()) {
    const tab = tabs.getByRole("tab", { name: tabLabels[id], exact: true });
    if ((await tab.getAttribute("aria-selected")) !== "true") await tab.click();
  }
  const region = lane(page, id, firm);
  await expect(region).toBeVisible();
  return region;
}

/** True when a box lies fully inside the viewport. */
export async function insideViewport(page: Page, locator: Locator): Promise<boolean> {
  const box = await locator.boundingBox();
  const viewport = page.viewportSize();
  if (!box || !viewport) return false;
  return box.x >= 0 && box.y >= 0 && box.x + box.width <= viewport.width + 0.5 && box.y + box.height <= viewport.height + 0.5;
}

export async function expectNoHorizontalOverflow(page: Page, maxWidth: number): Promise<void> {
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth), { message: "document scrollWidth" })
    .toBeLessThanOrEqual(maxWidth);
}
