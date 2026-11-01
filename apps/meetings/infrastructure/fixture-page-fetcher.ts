import type { PageFetcher } from "@diepen/voice/page-fetcher";

/**
 * Answers every website lookup with one fictional page, so tests and keyless runs of
 * "Make it yours" never fetch the internet.
 */
export const fixturePageFetcher: PageFetcher = (url) =>
  Promise.resolve({
    url,
    html: [
      "<!doctype html><html><head>",
      "<title>Harbourline Lettings</title>",
      '<meta name="description" content="Lettings and management for flat owners on the coast.">',
      '<meta name="theme-color" content="#1d4ed8">',
      "</head><body><h1>Harbourline Lettings</h1>",
      "<p>We let and manage flats for owners. Tenant calls, repairs, viewings and a monthly owner statement.</p>",
      "</body></html>",
    ].join(""),
  });
