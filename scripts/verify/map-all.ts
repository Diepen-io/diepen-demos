import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { appNames } from "./config.ts";

// `verify map` checks one app. This runs it for every app that exists, so `pnpm check` covers all.
let failed = 0;
for (const app of appNames) {
  if (!existsSync(join("apps", app, "app"))) continue;
  const run = spawnSync("node", ["scripts/verify/cli.ts", "map"], {
    stdio: "inherit",
    env: { ...process.env, VERIFY_APP: app },
  });
  if (run.status !== 0) failed++;
}
process.exitCode = failed ? 1 : 0;
