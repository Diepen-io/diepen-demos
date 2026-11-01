import { readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import type { Page } from "@playwright/test";

export type Persona = {
  signIn: (page: Page, baseUrl: string) => Promise<void>;
  // Without this check a failed sign-in passes, and the proof shows the sign-in form.
  isSignedIn?: (page: Page) => Promise<boolean>;
};

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// One repo, three apps. VERIFY_APP picks the app; each has its own port and feature map file.
const apps = { inbox: 3101, documents: 3102, meetings: 3103 } as const;
export type AppName = keyof typeof apps;
export const appNames = Object.keys(apps) as AppName[];

function currentApp(): AppName {
  const name = process.env.VERIFY_APP ?? "inbox";
  if (!(name in apps)) throw new Error(`VERIFY_APP must be one of ${appNames.join(", ")}`);
  return name as AppName;
}

/** Page routes from the App Router folders. Route groups drop out, API routes are not pages. */
export function pageRoutes(app: AppName): string[] {
  const root = join("apps", app, "app");
  const routes: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== "api") walk(path);
      if (entry.isFile() && /^page\.(tsx|ts|jsx|js)$/.test(entry.name)) {
        const parts = relative(root, dir)
          .split(sep)
          .filter((part) => part && !/^\(.*\)$/.test(part));
        routes.push(`/${parts.join("/")}`);
      }
    }
  };
  walk(root);
  return routes.sort();
}

const app = currentApp();

export const config = {
  port: apps[app],
  start: (port: number) => `pnpm --filter @diepen/${app} exec next dev --port ${port}`,
  // A path only this app answers with 2xx, so another app on the port never counts as ready.
  readyPath: "/api/health",
  flow: (id: string, outDir: string) =>
    `pnpm --filter @diepen/${app} exec playwright test --grep "@${escapeRegExp(id)}\\b" --trace on --output "${outDir}"`,
  routes: (): string[] => pageRoutes(app),
  expectedFailures: [] as RegExp[],
  featureMap: `docs/features/${app}.md`,
  // The demos have no accounts. Every visitor is anonymous.
  personas: {
    anon: { signIn: async () => {} },
  } satisfies Record<string, Persona>,
};
