import { guards as sharedGuards, type Guards } from "@diepen/ai/guards";
import type { AiProvider } from "@diepen/ai/provider";
import { getProvider } from "@diepen/ai/provider-factory";
import { fallbackResponse, unavailableResponse } from "@diepen/ai/route-responses";
import { z } from "zod";
import { extractBrandProfile } from "./brand-extraction.ts";
import { fetchPage as defaultFetchPage, PageFetchError, type PageFetcher } from "./page-fetcher.ts";

/**
 * The HTTP adapter for "Make it yours". Each app re-exports `handleBrandRequest` as `POST` in
 * `app/api/brand/route.ts`.
 */

export type BrandRouteDeps = {
  /** Apps pass a fixture fetcher in e2e, so tests never fetch real pages. */
  fetchPage: PageFetcher;
  /** Defaults to the provider from `getProvider()`, looked up per request. */
  provider?: AiProvider;
  /** Defaults to the guards every route shares. */
  guards?: Guards;
};

/** Visitors type "acme.com"; the fetcher needs a scheme. */
function withScheme(value: string): string {
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(value) ? value : `https://${value}`;
}

const bodySchema = z.object({
  url: z.string().trim().min(1).max(2048).transform(withScheme).pipe(z.url({ protocol: /^https?$/ })),
});

function badRequest(error: string, status = 400): Response {
  return Response.json({ error }, { status, headers: { "cache-control": "no-store" } });
}

export function createBrandHandler(deps: BrandRouteDeps): (request: Request) => Promise<Response> {
  return async (request) => {
    const body = bodySchema.safeParse(await request.json().catch(() => null));
    if (!body.success) return badRequest("Enter a website address, for example acme.com.");

    const guard = (deps.guards ?? sharedGuards).check(request);
    if (!guard.ok) return fallbackResponse(guard);

    const provider = deps.provider ?? getProvider();
    try {
      const profile = await extractBrandProfile({ url: body.data.url, fetchPage: deps.fetchPage, provider });
      return Response.json({ profile, provider: provider.name }, { headers: { "cache-control": "no-store" } });
    } catch (error) {
      if (error instanceof PageFetchError) return badRequest(error.message, 422);
      return unavailableResponse(error);
    }
  };
}

export const handleBrandRequest = createBrandHandler({ fetchPage: defaultFetchPage });
