import { execFileSync, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, openSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { config } from "./config.ts";

const stateFile = ".verify/server.json";
const logFile = ".verify/server.log";
type ServerState = { pid: number; port: number; cwd: string };

export function isWorktree(): boolean {
  try {
    const [gitDir, commonDir] = execFileSync(
      "git",
      ["rev-parse", "--path-format=absolute", "--git-dir", "--git-common-dir"],
      {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      },
    )
      .trim()
      .split("\n");
    return gitDir !== commonDir;
  } catch {
    return false;
  }
}

export function port(): number {
  if (process.env.VERIFY_PORT) return Number(process.env.VERIFY_PORT);
  if (!isWorktree()) return config.port;
  const hash = createHash("sha1").update(process.cwd()).digest().readUInt16BE(0);
  return config.port + 100 + (hash % 800);
}

export function baseUrl(): string {
  return process.env.VERIFY_URL ?? `http://localhost:${port()}`;
}

export async function answers(): Promise<boolean> {
  try {
    const url = new URL(config.readyPath, baseUrl());
    return (await fetch(url, { signal: AbortSignal.timeout(3_000) })).ok;
  } catch {
    return false;
  }
}

function state(): ServerState | undefined {
  try {
    return JSON.parse(readFileSync(stateFile, "utf8")) as ServerState;
  } catch {
    return undefined;
  }
}

function alive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

// An explicit VERIFY_URL (a preview or production) is trusted. Otherwise only our own server is.
export function ownsServer(): boolean {
  if (process.env.VERIFY_URL) return true;
  const current = state();
  return Boolean(
    current && current.cwd === process.cwd() && current.port === port() && alive(current.pid),
  );
}

export async function requireOwnServer(): Promise<boolean> {
  if (ownsServer() && (await answers())) return true;
  console.error(`No app from this checkout answers at ${baseUrl()}. Run: verify up`);
  return false;
}

export async function up(): Promise<number> {
  if (ownsServer() && (await answers())) {
    console.log(`ready ${baseUrl()}`);
    return 0;
  }
  if (!ownsServer() && (await answers())) {
    console.error(
      `${baseUrl()} answers, but this checkout did not start it. Stop that app, or set VERIFY_PORT.`,
    );
    return 1;
  }
  mkdirSync(".verify", { recursive: true });
  const log = openSync(logFile, "w");
  const child = spawn(config.start(port()), {
    shell: true,
    detached: true,
    stdio: ["ignore", log, log],
    env: { ...process.env, PORT: String(port()) },
  });
  writeFileSync(stateFile, JSON.stringify({ pid: child.pid, port: port(), cwd: process.cwd() }));
  let exitCode: number | undefined;
  child.on("exit", (code) => (exitCode = code ?? 1));
  child.unref();
  for (let second = 0; second < 180; second++) {
    await new Promise((resolve) => setTimeout(resolve, 1_000));
    if (exitCode !== undefined) {
      rmSync(stateFile, { force: true });
      console.error(`The start command exited with code ${exitCode}.\n${logTail()}`);
      return 1;
    }
    if (await answers()) {
      console.log(`ready ${baseUrl()}  (log: ${logFile})`);
      return 0;
    }
  }
  console.error(`No 2xx from ${baseUrl()}${config.readyPath} after 180 s.\n${logTail()}`);
  return 1;
}

export function down(): number {
  const current = state();
  rmSync(stateFile, { force: true });
  if (!current || !alive(current.pid)) {
    console.log("No server from this checkout is running.");
    return 0;
  }
  process.kill(-current.pid, "SIGTERM");
  console.log(`Stopped the app on port ${current.port}.`);
  return 0;
}

export async function doctor(): Promise<number> {
  const owned = ownsServer();
  const answering = await answers();
  console.log(`checkout   ${isWorktree() ? "worktree" : "main"} ${process.cwd()}`);
  console.log(`url        ${baseUrl()}${process.env.VERIFY_URL ? " (VERIFY_URL)" : ""}`);
  console.log(`server     ${owned ? "started by this checkout" : "not started by this checkout"}`);
  console.log(`answers    ${answering ? `2xx at ${config.readyPath}` : "no"}`);
  console.log(`personas   ${Object.keys(config.personas).join(", ")}`);
  if (!owned && answering) console.log("problem    another app holds this port");
  return owned && answering ? 0 : 1;
}

function logTail(): string {
  if (!existsSync(logFile)) return "";
  return readFileSync(logFile, "utf8").trim().split("\n").slice(-15).join("\n");
}
