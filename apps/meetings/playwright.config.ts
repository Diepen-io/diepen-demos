import { createHash } from "node:crypto";
import { defineConfig, devices } from "@playwright/test";

// Each checkout and app gets its own e2e port, so parallel worktrees never share a server.
const port = 4100 + (createHash("sha1").update(import.meta.dirname).digest().readUInt16BE(0) % 800);
const external = process.env.VERIFY_URL;

export default defineConfig({
  testDir: "e2e",
  globalSetup: "./e2e/support/warm-up.ts",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: [["list"]],
  use: { baseURL: external ?? `http://localhost:${port}`, trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "phone", use: { ...devices["Pixel 7"] } },
  ],
  webServer: external
    ? undefined
    : {
        // A build cache from older sources makes the dev server reload pages mid-test, so every run starts clean.
        command: `rm -rf .next-e2e && next dev --port ${port}`,
        // Waiting for the film page compiles it before the timed film tests start.
        url: `http://localhost:${port}/`,
        reuseExistingServer: false,
        timeout: 120_000,
        // Every flow runs from one IP, so the per-IP rate limit is raised for the suite.
        env: { AI_PROVIDER: "mock", AI_RATE_LIMIT_PER_MINUTE: "1000", NEXT_DIST_DIR: ".next-e2e", NEXT_TELEMETRY_DISABLED: "1" },
      },
});
