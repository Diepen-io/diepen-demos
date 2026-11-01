import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { config } from "./config.ts";
import { checkMap, readFeatureMap } from "./feature-map.ts";
import type { Feature } from "./feature-map.ts";
import { flow } from "./flow.ts";
import { baseUrl, doctor, down, requireOwnServer, up } from "./server.ts";
import { smoke } from "./smoke.ts";
import type { SmokeResult } from "./smoke.ts";

const usage = `verify - prove a change in the running app

  verify up                     start this checkout's app on its own port, wait for a 2xx
  verify down                   stop the app this checkout started
  verify doctor                 which app answers, and whether this checkout owns it
  verify features               list feature map ids, routes, personas and status
  verify map                    fail when the feature map and the app's routes disagree
  verify flow <id>              run the feature's tagged end-to-end flow: the behavior proof
  verify smoke <id|/path>       screenshots, console errors, failed requests, long tasks
      --as <persona>            sign in as this persona (default: the feature's persona)
      --trace                   also record a performance trace (desktop)
      --headed                  show the browser

Set VERIFY_URL to run flow or smoke against a preview or production.
Proof lands in .verify/proof/<time>-<target>/. Exit code 1 means the proof failed.`;

const personas: Record<string, (typeof config.personas)[keyof typeof config.personas]> =
  config.personas;

async function main(): Promise<number> {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      as: { type: "string" },
      trace: { type: "boolean", default: false },
      headed: { type: "boolean", default: false },
      help: { type: "boolean", default: false },
    },
  });
  const [command, target, extra] = positionals;
  if (values.help || !command) return print(usage, 0);
  if (extra) return print(`unexpected argument "${extra}"\n\n${usage}`, 1);
  if (command === "up") return up();
  if (command === "down") return down();
  if (command === "doctor") return doctor();
  if (command === "features") return features();
  if (command === "map") return map();
  if (command === "flow" && target) return runFlow(target);
  if (command === "smoke" && target) return runSmoke(target, values);
  return print(`unknown or incomplete command "${positionals.join(" ")}"\n\n${usage}`, 1);
}

function print(text: string, code: number): number {
  (code === 0 ? console.log : console.error)(text);
  return code;
}

function loadMap(): Feature[] {
  const { features: rows, warnings } = readFeatureMap(config.featureMap);
  for (const warning of warnings) console.error(`warning: ${warning}`);
  return rows;
}

function features(): number {
  const rows = loadMap();
  if (rows.length === 0) return print(`No feature rows in ${config.featureMap}.`, 1);
  for (const row of rows)
    console.log([row.id, row.route ?? "-", row.persona, row.status].join("\t"));
  return 0;
}

function map(): number {
  const routes = config.routes();
  if (routes.length === 0) return print("config.routes() returns no routes. Fill it in first.", 1);
  const problems = checkMap(loadMap(), routes);
  for (const problem of problems) console.error(problem);
  return problems.length ? 1 : print(`feature map matches ${routes.length} routes`, 0);
}

function findFeature(id: string): Feature | undefined {
  const rows = loadMap();
  const feature = rows.find((row) => row.id === id);
  if (!feature) {
    const area = id.split(".")[0] ?? id;
    const near = rows.filter((row) => row.id.startsWith(area)).map((row) => row.id);
    console.error(
      `No feature "${id}" in the map.${near.length ? ` Near: ${near.join(", ")}` : ""}`,
    );
  }
  return feature;
}

function proofDir(target: string): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return join(".verify", "proof", `${stamp}-${target.replace(/[^a-z0-9.-]+/gi, "_")}`);
}

async function runFlow(id: string): Promise<number> {
  if (!findFeature(id) || !(await requireOwnServer())) return 1;
  return flow(id, proofDir(id), baseUrl());
}

async function runSmoke(
  target: string,
  flags: { as?: string; trace: boolean; headed: boolean },
): Promise<number> {
  const feature = target.startsWith("/") ? undefined : findFeature(target);
  if (!target.startsWith("/") && !feature) return 1;
  const route = feature ? feature.route : target;
  if (!route) return print(`${target} has no route. Put it in backticks first in "Reach it".`, 1);
  const personaName = flags.as ?? feature?.persona ?? "anon";
  const persona = personas[personaName];
  if (!persona) {
    return print(`Unknown persona "${personaName}". Known: ${Object.keys(personas).join(", ")}`, 1);
  }
  if (!(await requireOwnServer())) return 1;

  const outDir = proofDir(target);
  const result = await smoke({
    url: new URL(route, baseUrl()).toString(),
    persona,
    baseUrl: baseUrl(),
    expectedFailures: config.expectedFailures,
    outDir,
    trace: flags.trace,
    headed: flags.headed,
  });
  const report = formatReport(target, personaName, route, result);
  writeFileSync(join(outDir, "report.md"), report);
  console.log(`${report}\nproof: ${outDir}`);
  const failures =
    result.problems.length + result.consoleErrors.length + result.failedRequests.length;
  return failures > 0 ? 1 : 0;
}

function formatReport(target: string, persona: string, route: string, result: SmokeResult): string {
  const list = (items: string[]) =>
    items.length ? items.map((item) => `- ${item}`).join("\n") : "- none";
  const slowest = result.longTasksMs.length ? Math.max(...result.longTasksMs) : 0;
  return [
    `# Smoke: ${target}`,
    `Route ${route} as ${persona}, desktop 1440 and iPhone 13. Smoke shows the route renders cleanly. The behavior proof is verify flow.`,
    `## Problems\n${list(result.problems)}`,
    `## Console errors\n${list(result.consoleErrors)}`,
    `## Failed requests\n${list(result.failedRequests)}`,
    `## Long tasks\n- ${result.longTasksMs.length} over 50 ms, slowest ${slowest} ms`,
    `## Screenshots\n${list(result.screenshots)}`,
  ].join("\n\n");
}

try {
  process.exitCode = await main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
