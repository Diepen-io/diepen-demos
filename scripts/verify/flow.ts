import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { config } from "./config.ts";

// A flow drives the real user path and asserts the outcome. It is the behavior proof;
// smoke only shows that a route renders cleanly.
export function flow(id: string, outDir: string, baseUrl: string): number {
  mkdirSync(outDir, { recursive: true });
  const command = config.flow(id, outDir);
  const run = spawnSync(command, {
    shell: true,
    stdio: "inherit",
    env: { ...process.env, VERIFY_URL: baseUrl },
  });
  const passed = run.status === 0;
  const report = [
    `# Flow: ${id}`,
    `Result: ${passed ? "passed" : "failed"} against ${baseUrl}`,
    `Command: ${command}`,
    passed ? "" : "A flow that matches no test also fails. Tag the test with @" + id + ".",
  ].join("\n\n");
  writeFileSync(join(outDir, "report.md"), `${report.trim()}\n`);
  console.log(`\n${report.trim()}\nproof: ${outDir}`);
  return passed ? 0 : 1;
}
