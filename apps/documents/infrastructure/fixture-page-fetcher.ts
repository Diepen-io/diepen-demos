import type { PageFetcher } from "@diepen/voice/page-fetcher";

/**
 * "Make it yours" without the internet: with the mock provider, tests and keyless runs read this
 * page for any address, and the mock drafts the profile from the domain name.
 */
export const fixturePageFetcher: PageFetcher = (url) =>
  Promise.resolve({
    url,
    html: [
      "<!doctype html><html><head>",
      "<title>Your firm</title>",
      '<meta name="description" content="Tax returns and bookkeeping for families and freelancers.">',
      '<meta name="theme-color" content="#0f766e">',
      "</head><body><h1>Your firm</h1><p>Tax returns and bookkeeping.</p></body></html>",
    ].join(""),
  });
