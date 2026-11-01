import { expect, type Page } from "@playwright/test";

/** Section 7 of the plan: nothing may make the page scroll sideways, at any width. */
export async function expectNoHorizontalOverflow(page: Page, where: string): Promise<void> {
  const { scrollWidth, innerWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  expect(scrollWidth, `${where} is ${scrollWidth} px wide in a ${innerWidth} px viewport`).toBeLessThanOrEqual(innerWidth);
}

/** Below 768 px the film shows the focus panel only and live mode uses a bottom tab bar. */
export function isNarrow(page: Page): boolean {
  return (page.viewportSize()?.width ?? 0) < 768;
}

/** Opens a page once its scripts have loaded and hydrated, so the first click is handled by React. */
export async function gotoApp(page: Page, path: string): Promise<void> {
  await page.goto(path, { waitUntil: "networkidle" });
}

export function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
