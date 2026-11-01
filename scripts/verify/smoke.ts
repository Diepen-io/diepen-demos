import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { chromium, devices } from "@playwright/test";
import type { BrowserContextOptions, Page } from "@playwright/test";
import type { Persona } from "./config.ts";

export type SmokeRequest = {
  url: string;
  persona: Persona;
  baseUrl: string;
  expectedFailures: RegExp[];
  outDir: string;
  trace: boolean;
  headed: boolean;
};

export type SmokeResult = {
  problems: string[];
  consoleErrors: string[];
  failedRequests: string[];
  longTasksMs: number[];
  screenshots: string[];
};

/** A browser context takes everything a device preset holds except the browser type. */
const { viewport, userAgent, deviceScaleFactor, isMobile, hasTouch } = devices["iPhone 13"];
const iPhone: BrowserContextOptions = { viewport, userAgent, deviceScaleFactor, isMobile, hasTouch };
const contexts: Record<string, BrowserContextOptions> = {
  desktop: { viewport: { width: 1440, height: 900 } },
  phone: iPhone,
};

type LongTaskWindow = { __verifyLongTasks?: number[] };

export async function smoke(request: SmokeRequest): Promise<SmokeResult> {
  mkdirSync(request.outDir, { recursive: true });
  const result: SmokeResult = {
    problems: [],
    consoleErrors: [],
    failedRequests: [],
    longTasksMs: [],
    screenshots: [],
  };
  const browser = await chromium.launch({ headless: !request.headed });
  try {
    for (const [name, options] of Object.entries(contexts)) {
      // A fresh context is an empty profile: no cookies from the owner's own browser.
      const context = await browser.newContext(options);
      const page = await context.newPage();
      watch(page, result, name, request.expectedFailures);
      await page.addInitScript(observeLongTasks);
      await request.persona.signIn(page, request.baseUrl);
      if (request.persona.isSignedIn && !(await request.persona.isSignedIn(page))) {
        result.problems.push(`[${name}] the persona did not sign in`);
      }

      const tracing = request.trace && name === "desktop";
      const tracePath = join(request.outDir, "trace.json");
      if (tracing) await browser.startTracing(page, { path: tracePath, screenshots: true });
      await page.goto(request.url, { waitUntil: "load" });
      // Apps with live listeners (Firestore, Convex, polling) never go idle, so idle is best effort.
      await page.waitForLoadState("networkidle", { timeout: 5_000 }).catch(() => {});
      if (tracing) await browser.stopTracing();

      const wanted = new URL(request.url).pathname;
      const landed = new URL(page.url()).pathname;
      if (landed !== wanted)
        result.problems.push(`[${name}] asked for ${wanted}, landed on ${landed}`);

      const screenshot = join(request.outDir, `${name}.png`);
      await page.screenshot({ path: screenshot, fullPage: true });
      result.screenshots.push(screenshot);
      const longTasks = await page.evaluate(
        () => (window as LongTaskWindow).__verifyLongTasks ?? [],
      );
      result.longTasksMs.push(...longTasks);
      await context.close();
    }
  } finally {
    await browser.close();
  }
  return result;
}

function watch(page: Page, result: SmokeResult, name: string, expected: RegExp[]): void {
  const isExpected = (url: string) => expected.some((pattern) => pattern.test(url));
  page.on("console", (message) => {
    const url = message.location().url;
    if (message.type() !== "error" || (url && isExpected(url))) return;
    result.consoleErrors.push(`[${name}] ${message.text()}`);
  });
  page.on("pageerror", (error) =>
    result.consoleErrors.push(`[${name}] uncaught: ${error.message}`),
  );
  page.on("requestfailed", (request) => {
    const reason = request.failure()?.errorText ?? "failed";
    // Navigation cancels in-flight requests on purpose. Those are not findings.
    if (reason.includes("ERR_ABORTED") || isExpected(request.url())) return;
    result.failedRequests.push(`[${name}] ${request.method()} ${request.url()} ${reason}`);
  });
  page.on("response", (response) => {
    if (response.status() < 400 || isExpected(response.url())) return;
    const request = response.request();
    result.failedRequests.push(
      `[${name}] ${response.status()} ${request.method()} ${response.url()}`,
    );
  });
}

function observeLongTasks(): void {
  const durations: number[] = [];
  (window as LongTaskWindow).__verifyLongTasks = durations;
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) durations.push(Math.round(entry.duration));
  }).observe({ type: "longtask", buffered: true });
}
