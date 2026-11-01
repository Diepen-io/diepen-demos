import type { AiProvider } from "@diepen/ai/provider";
import { fetchPage, type FetchedPage, type PageFetcher } from "./page-fetcher.ts";

/**
 * "Make it yours" without the internet: it answers with a small made-up page for the address, so
 * tests and keyless runs work and no request leaves the server. The mock provider drafts the
 * profile from the domain name.
 */
export const fixturePageFetcher: PageFetcher = (url) => {
  const host = new URL(url).hostname.replace(/^www\./, "");
  const page: FetchedPage = {
    url,
    html: [
      '<!doctype html><html lang="en"><head>',
      `<title>${host}</title>`,
      `<meta name="description" content="The website of ${host}.">`,
      '<meta name="theme-color" content="#1d4ed8">',
      "</head><body>",
      `<h1>${host}</h1>`,
      "<p>Opening hours: Monday to Friday 9:00 to 17:00.</p>",
      "</body></html>",
    ].join(""),
  };
  return Promise.resolve(page);
};

/** The fixture page under the mock provider, since without a key nothing may leave the server; else the real web. */
export function pageFetcherFor(provider: AiProvider["name"]): PageFetcher {
  return provider === "mock" ? fixturePageFetcher : fetchPage;
}
