import { test as base, expect } from "@playwright/test";

export type ConsoleGuard = {
  /** Lets one expected console error through, for example the 502 a test routes on purpose. */
  allow: (pattern: RegExp) => void;
};

/**
 * Every flow test fails on a console error or an uncaught page error. In the phone project it
 * also fails when the page it ends on scrolls sideways.
 */
export const test = base.extend<{ consoleGuard: ConsoleGuard }>({
  consoleGuard: [
    async ({ page }, use, testInfo) => {
      const errors: string[] = [];
      const allowed: RegExp[] = [];
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(`console: ${message.text()}`);
      });
      page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));

      await use({ allow: (pattern) => allowed.push(pattern) });

      if (testInfo.project.name === "phone" && !page.isClosed() && page.url().startsWith("http")) {
        const widths = await page.evaluate(() => ({
          scroll: document.documentElement.scrollWidth,
          viewport: window.innerWidth,
        }));
        expect(widths.scroll, `${page.url()} scrolls sideways`).toBeLessThanOrEqual(widths.viewport);
      }
      expect(errors.filter((error) => !allowed.some((pattern) => pattern.test(error)))).toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
