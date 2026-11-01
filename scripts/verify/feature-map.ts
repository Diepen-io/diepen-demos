import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

export type Feature = {
  id: string;
  outcome: string;
  route: string | undefined;
  persona: string;
  status: string;
  file: string;
};

export type FeatureMap = { features: Feature[]; warnings: string[] };

const featureId = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/;
const looksLikeId = /^[\w-]+\.[\w.-]+$/;
const statuses = ["shipped", "planned"];

export function readFeatureMap(path: string): FeatureMap {
  const map: FeatureMap = { features: [], warnings: [] };
  for (const file of markdownFiles(path)) parseFile(file, map);
  return map;
}

function markdownFiles(path: string): string[] {
  if (!existsSync(path)) return [];
  if (!statSync(path).isDirectory()) return [path];
  return readdirSync(path)
    .filter((name) => name.endsWith(".md"))
    .sort()
    .map((name) => join(path, name));
}

function parseFile(file: string, map: FeatureMap): void {
  let inFence = false;
  readFileSync(file, "utf8")
    .split("\n")
    .forEach((line, index) => {
      if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
      if (inFence || !line.trim().startsWith("|")) return;
      const [rawId = "", outcome = "", reach = "", rawPersona = "", rawStatus = ""] = cells(line);
      const id = stripTicks(rawId);
      const persona = stripTicks(rawPersona);
      const status = stripTicks(rawStatus);
      const where = `${file}:${index + 1}`;
      if (!featureId.test(id)) {
        if (looksLikeId.test(id))
          map.warnings.push(`${where} "${id}" is not a lowercase area.action id`);
        return;
      }
      if (!statuses.includes(status)) {
        map.warnings.push(`${where} ${id} has status "${status}", use ${statuses.join(" or ")}`);
      }
      const route = reach.match(/`(\/[^`]*)`/)?.[1];
      map.features.push({ id, outcome, route, persona, status, file });
    });
}

function cells(line: string): string[] {
  return line
    .trim()
    .replace(/^\||\|$/g, "")
    .split(/(?<!\\)\|/)
    .map((cell) => cell.trim().replace(/\\\|/g, "|"));
}

function stripTicks(cell: string): string {
  return cell.replace(/^`|`$/g, "");
}

function matches(pattern: string, path: string): boolean {
  const source = pattern
    .split("/")
    .map((part) =>
      /^\[\.\.\..+\]$/.test(part)
        ? ".+"
        : /^(\[.+\]|:.+)$/.test(part)
          ? "[^/]+"
          : part.replace(/[.*+?^${}()|\\]/g, "\\$&"),
    )
    .join("/");
  return new RegExp(`^${source}/?$`).test(path);
}

export function checkMap(features: Feature[], routes: string[]): string[] {
  const problems: string[] = [];
  for (const feature of features) {
    const path = feature.route?.split(/[?#]/)[0];
    if (feature.status !== "shipped" || !path) continue;
    if (!routes.some((route) => matches(route, path))) {
      problems.push(`${feature.id} points to ${path}, which the app does not serve`);
    }
  }
  for (const route of routes) {
    const covered = features.some((feature) => {
      const path = feature.route?.split(/[?#]/)[0];
      return path !== undefined && matches(route, path);
    });
    if (!covered) problems.push(`${route} has no feature map row`);
  }
  return problems;
}
