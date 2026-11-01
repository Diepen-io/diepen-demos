import type { FetchedPage, PageFetcher } from "@diepen/voice/page-fetcher";

/**
 * The page fetcher under the mock provider: it answers with a small made-up page for the address,
 * so "Make it yours" works in tests and without a key, and no request leaves the server.
 */
export const fixturePageFetcher: PageFetcher = (url) => {
  const host = new URL(url).hostname.replace(/^www\./, "");
  const page: FetchedPage = {
    url,
    html: [
      "<!doctype html><html lang=\"en\"><head>",
      `<title>${host}</title>`,
      `<meta name="description" content="The website of ${host}.">`,
      "<meta name=\"theme-color\" content=\"#1d4ed8\">",
      "</head><body>",
      `<h1>${host}</h1>`,
      "<p>Opening hours: Monday to Friday 9:00 to 17:00.</p>",
      "</body></html>",
    ].join(""),
  };
  return Promise.resolve(page);
};
