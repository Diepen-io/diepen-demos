import { expect, type Locator, type Page } from "@playwright/test";

/** Opens the "Make it yours" panel from the shell header and returns it. */
export async function openMakeItYours(page: Page): Promise<Locator> {
  await page.getByRole("button", { name: "Make it yours" }).first().click();
  const panel = page.getByRole("dialog", { name: "Make it yours" });
  await expect(panel).toBeVisible();
  return panel;
}

/** Applies one of the example companies and closes the panel. */
export async function pickPreset(page: Page, companyName: string): Promise<void> {
  const panel = await openMakeItYours(page);
  await panel.getByRole("button").filter({ hasText: companyName }).click();
  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
}

/** The brand colour the brand provider sets for the whole page. */
export function brandColour(page: Page): Promise<string> {
  return page
    .locator("[data-brand-scope]")
    .first()
    .evaluate((element) => getComputedStyle(element).getPropertyValue("--brand").trim());
}
