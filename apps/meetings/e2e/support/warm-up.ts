import type { FullConfig } from "@playwright/test";

/**
 * `next dev` compiles each route on its first request and reloads open pages when it does. With
 * parallel workers on a loaded machine that first compile holds every test's first page load, so
 * every route compiles once here.
 */
export default async function warmUp(config: FullConfig): Promise<void> {
  const baseURL = config.projects[0]?.use.baseURL;
  if (!baseURL) return;
  const post = { method: "POST", body: "{}", headers: { "content-type": "application/json" } };
  const requests: [string, RequestInit?][] = [["/"], ["/live"], ["/api/outputs", post], ["/api/brand", post]];
  for (const [path, init] of requests) await fetch(new URL(path, baseURL), init);
}
