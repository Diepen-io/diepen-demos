import { describe, expect, it } from "vitest";
import { decodeEntities, extractHtmlSignals } from "./html-signals.ts";

const html = `<!doctype html>
<html><head>
  <title>Acme Bakery &amp; Caf&eacute; | Berlin</title>
  <meta name="description" content="Fresh bread every morning since 1998.">
  <meta name="theme-color" content="#C2410C">
  <meta property="og:image" content="/img/share.jpg">
  <meta property='og:site_name' content='Acme Bakery'>
  <link rel="icon" href="/favicon.ico">
  <link rel="apple-touch-icon" href="https://cdn.acme.example/touch.png">
  <link rel="stylesheet" href="/site.css">
  <style>.btn { background: #c2410c; color: #fff } .hero { border-color: #C2410C }</style>
  <script>window.secret = "do not read";</script>
</head>
<body>
  <header><h1>Acme Bakery</h1></header>
  <p style="color: #1f2937">Open daily from 7:00. Sourdough &#8364;4.50.</p>
  <noscript>Enable JavaScript</noscript>
  <!-- a comment -->
  <script type="application/ld+json">{"@type":"Bakery"}</script>
</body></html>`;

describe("extractHtmlSignals", () => {
  const signals = extractHtmlSignals(html, "https://acme.example/de/");

  it("reads title, description, theme colour and site name", () => {
    expect(signals.title).toBe("Acme Bakery & Caf&eacute; | Berlin");
    expect(signals.description).toBe("Fresh bread every morning since 1998.");
    expect(signals.themeColor).toBe("#c2410c");
    expect(signals.siteName).toBe("Acme Bakery");
  });

  it("makes image and icon URLs absolute and skips non-icon links", () => {
    expect(signals.ogImage).toBe("https://acme.example/img/share.jpg");
    expect(signals.icons).toEqual(["https://acme.example/favicon.ico", "https://cdn.acme.example/touch.png"]);
  });

  it("keeps visible text only", () => {
    expect(signals.text).toBe("Acme Bakery Open daily from 7:00. Sourdough €4.50.");
    expect(signals.text).not.toMatch(/secret|Bakery"|Enable JavaScript|comment/);
  });

  it("ranks colours from style tags and inline styles by frequency", () => {
    expect(signals.colors).toEqual(["#c2410c", "#ffffff", "#1f2937"]);
  });

  it("cuts long text to about 12,000 characters", () => {
    const long = extractHtmlSignals(`<p>${"word ".repeat(5000)}</p>`, "https://acme.example/");
    expect(long.text.length).toBeLessThanOrEqual(12_000);
  });

  it.each(["<script", "<!--", "<meta", "<style", "<title", "<svg x"])(
    "stays linear on a hostile 1.5 MB page of unclosed %s tags",
    (open) => {
      const html = `<p>Hi</p>${`${open} `.repeat(Math.floor(1_500_000 / (open.length + 1)))}`;
      const started = performance.now();
      const result = extractHtmlSignals(html, "https://acme.example/");
      expect(performance.now() - started).toBeLessThan(1_000);
      expect(result.text.startsWith("Hi")).toBe(true);
    },
  );

  it("keeps text after a closed hidden element and drops an unclosed one", () => {
    const html = "<p>One</p><script>var a = '<p>no</p>';</script><p>Two</p><style>p{}";
    expect(extractHtmlSignals(html, "https://acme.example/").text).toBe("One Two");
  });

  it("handles a page with nothing in it", () => {
    expect(extractHtmlSignals("", "https://acme.example/")).toEqual({ icons: [], text: "", colors: [] });
  });
});

describe("decodeEntities", () => {
  it("decodes named and numeric entities and leaves unknown ones", () => {
    expect(decodeEntities("&lt;b&gt; &#39;x&#x27; &copy;")).toBe("<b> 'x' &copy;");
  });
});
