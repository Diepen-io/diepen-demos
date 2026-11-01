import type { Page } from "@playwright/test";

/**
 * Collects console errors, uncaught page errors and failed requests while a test runs.
 * Start it before the first navigation, then expect the list to be empty.
 */
export function collectPageProblems(page: Page): string[] {
  const problems: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") problems.push(`console error: ${message.text()}`);
  });
  page.on("pageerror", (error) => problems.push(`page error: ${error.message}`));
  page.on("requestfailed", (request) => {
    const failure = request.failure()?.errorText ?? "unknown failure";
    // A navigation or a superseded prefetch aborts requests on purpose. Nothing broke.
    if (failure.includes("ERR_ABORTED")) return;
    problems.push(`request failed: ${request.method()} ${request.url()} (${failure})`);
  });
  page.on("response", (response) => {
    if (response.status() >= 400) problems.push(`HTTP ${response.status()}: ${response.request().method()} ${response.url()}`);
  });
  return problems;
}
