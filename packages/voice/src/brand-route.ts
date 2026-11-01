import { guards as sharedGuards, type Guards } from "@diepen/ai/guards";
import type { AiProvider } from "@diepen/ai/provider";
import { getProvider } from "@diepen/ai/provider-factory";
import { BodyTooLargeError, readBodyText } from "@diepen/ai/request-body";
import { z } from "zod";
import { extractBrandProfile } from "./brand-extraction.ts";
import { PageFetchError, type PageFetcher } from "./page-fetcher.ts";

/**
 * The HTTP adapter for "Make it yours". Each app's `app/api/brand/route.ts` builds it from the
 * container's page fetcher, provider and guards. Every error answers `{ message }`, which the panel
 * shows as it is: the visitor stays in the panel, so no answer here sends them to the film.
 */

export type BrandRouteDeps = {
  /** Apps pass a fixture fetcher under the mock provider, so tests never fetch real pages. */
  fetchPage: PageFetcher;
  /** Defaults to the provider from `getProvider()`, looked up per request. */
  provider?: AiProvider;
  /** Defaults to the guards every route shares. */
  guards?: Guards;
};

/** A URL of 2048 characters in JSON fits well inside this. */
export const maxBrandRequestBytes = 4096;

/** Visitors type "acme.com"; the fetcher needs a scheme. */
function withScheme(value: string): string {
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(value) ? value : `https://${value}`;
}

const bodySchema = z.object({
  url: z.string().trim().min(1).max(2048).transform(withScheme).pipe(z.url({ protocol: /^https?$/ })),
});

const messages = {
  invalid: "Enter a website address, for example acme.com.",
  tooLarge: "That address is too long. Enter the website's home page, for example acme.com.",
  guardTrip: "Live answers are paused for now. Fill in the form instead.",
  unavailable: "Your website could not be read right now. Try again, or fill in the form.",
};

function answer(message: string, status: number): Response {
  return Response.json({ message }, { status, headers: { "cache-control": "no-store" } });
}

/** The body as JSON, read under the byte cap; `null` when it is not JSON. */
async function readJson(request: Request): Promise<unknown> {
  const text = await readBodyText(request, maxBrandRequestBytes);
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

export function createBrandHandler(deps: BrandRouteDeps): (request: Request) => Promise<Response> {
  return async (request) => {
    let json: unknown;
    try {
      json = await readJson(request);
    } catch (error) {
      if (error instanceof BodyTooLargeError) return answer(messages.tooLarge, 413);
      throw error;
    }
    const body = bodySchema.safeParse(json);
    if (!body.success) return answer(messages.invalid, 400);

    const guard = (deps.guards ?? sharedGuards).check(request);
    if (!guard.ok) return answer(messages.guardTrip, 429);

    const provider = deps.provider ?? getProvider();
    try {
      const profile = await extractBrandProfile({ url: body.data.url, fetchPage: deps.fetchPage, provider });
      return Response.json({ profile, provider: provider.name }, { headers: { "cache-control": "no-store" } });
    } catch (error) {
      if (error instanceof PageFetchError) return answer(error.message, 422);
      console.error("Brand extraction failed", error);
      return answer(messages.unavailable, 503);
    }
  };
}
