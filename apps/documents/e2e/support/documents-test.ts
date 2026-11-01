import { expect, test as base } from "@playwright/test";

/**
 * The `test` every documents spec uses. It fails a test on any console error or page error and,
 * in the phone project, on horizontal overflow of the page the test ends on.
 */

type Options = {
  /** Console errors a test causes on purpose, for example the 429 of a tripped cost guard. */
  allowedConsoleErrors: RegExp[];
};

export const test = base.extend<Options & { pageHealth: void }>({
  allowedConsoleErrors: [[], { option: true }],
  pageHealth: [
    async ({ page, allowedConsoleErrors }, use, testInfo) => {
      const errors: string[] = [];
      page.on("console", (message) => {
        if (message.type() !== "error") return;
        const text = message.text();
        if (!allowedConsoleErrors.some((pattern) => pattern.test(text))) errors.push(`console: ${text}`);
      });
      page.on("pageerror", (error) => errors.push(`page: ${error.message}`));

      await use();

      expect(errors, "console and page errors").toEqual([]);
      if (testInfo.project.name === "phone" && testInfo.status === testInfo.expectedStatus && page.url() !== "about:blank") {
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow, "horizontal overflow in px").toBeLessThanOrEqual(0);
      }
    },
    { auto: true },
  ],
});

export { expect };
