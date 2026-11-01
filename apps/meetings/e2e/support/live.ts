import type { Locator, Page } from "@playwright/test";
import { expect } from "./test";

export const outputKinds = ["summary", "numbers", "crm", "proposal", "email", "meeting"] as const;

/** The live demo answers with the mock provider in e2e; the first answer waits for a dev compile. */
export const outputTimeout = 30_000;

/** An input tab ("Record", "Paste", "Sample call"), whether it is built as a tab or a button. */
export function inputTab(page: Page, name: string): Locator {
  return page.getByRole("tab", { name, exact: true }).or(page.getByRole("button", { name, exact: true }));
}

/** The one editable transcript box every input tab ends in. */
export function transcriptBox(page: Page): Locator {
  return page.getByRole("textbox", { name: /transcript/i });
}

export function turnIntoProposal(page: Page): Locator {
  return page.getByRole("button", { name: "Turn this call into a proposal" });
}

export function output(page: Page, kind: (typeof outputKinds)[number]): Locator {
  return page.locator(`[data-output="${kind}"]`);
}

/** Records the order in which outputs first appear, so a test can check the reveal sequence. */
export async function watchOutputOrder(page: Page): Promise<() => Promise<string[]>> {
  await page.evaluate(() => {
    const seen: string[] = [];
    (window as unknown as { __outputOrder: string[] }).__outputOrder = seen;
    const note = () => {
      for (const element of document.querySelectorAll("[data-output]")) {
        const kind = element.getAttribute("data-output");
        if (kind && !seen.includes(kind)) seen.push(kind);
      }
    };
    note();
    new MutationObserver(note).observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["data-output"],
    });
  });
  return () => page.evaluate(() => (window as unknown as { __outputOrder: string[] }).__outputOrder);
}

export async function expectAllOutputs(page: Page) {
  for (const kind of outputKinds) {
    await expect(output(page, kind)).toBeVisible({ timeout: outputTimeout });
  }
}

/** Opens live mode, loads the sample call and waits for all six outputs. */
export async function runSampleCall(page: Page, path = "/live") {
  await page.goto(path);
  await inputTab(page, "Sample call").click();
  await expect(transcriptBox(page)).not.toHaveValue("");
  await turnIntoProposal(page).click();
  await expectAllOutputs(page);
}

/** A fictional six-line call between the preset's owner and a prospect who names 12 and 40. */
export const rosaCall = [
  "[00:00] Jonas Albers: Hi Rosa, thanks for taking the call. Tell me about your flats.",
  "[00:06] Rosa Lindqvist: We own 12 flats in two buildings near the harbour.",
  "[00:14] Jonas Albers: And how much time do they take you each month?",
  "[00:19] Rosa Lindqvist: About 40 hours a month, mostly chasing late rent and repairs.",
  "[00:31] Jonas Albers: Then full management would take that off your plate. Shall I send a proposal?",
  "[00:38] Rosa Lindqvist: Yes please, send it today so I can read it this week.",
].join("\n");
