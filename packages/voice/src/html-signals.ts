/**
 * The brand signals in one HTML page. Pure, with no DOM parser: the output feeds a model that
 * tolerates the odd miss. The page comes from any website, so every scan is a single forward pass
 * with indexOf. Lazy regexes like `<style>[\s\S]*?</style>` go quadratic on unclosed tags.
 */

export type HtmlSignals = {
  title?: string;
  description?: string;
  themeColor?: string;
  ogImage?: string;
  siteName?: string;
  /** Absolute URLs of the page's icons, in page order. */
  icons: string[];
  /** Visible text without scripts and styles, cut to about 12,000 characters. */
  text: string;
  /** Six-digit lowercase hex colours from inline styles and style tags, most frequent first. */
  colors: string[];
};

const maxTextChars = 12_000;
const maxColors = 8;

const namedEntities: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

export function decodeEntities(value: string): string {
  return value.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, code: string) => {
    if (code[0] === "#") {
      const point = code[1]?.toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(point) && point > 0 && point <= 0x10ffff ? String.fromCodePoint(point) : entity;
    }
    return namedEntities[code.toLowerCase()] ?? entity;
  });
}

function clean(value: string | undefined): string | undefined {
  const text = value === undefined ? "" : decodeEntities(value).replace(/\s+/g, " ").trim();
  return text || undefined;
}

function attributes(tag: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const match of tag.matchAll(/([^\s=/<>"']+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)) {
    const name = match[1]?.toLowerCase();
    if (name) result[name] = match[2] ?? match[3] ?? match[4] ?? "";
  }
  return result;
}

function absoluteUrl(href: string | undefined, base: string): string | undefined {
  if (!href) return undefined;
  try {
    const url = new URL(decodeEntities(href.trim()), base);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : undefined;
  } catch {
    return undefined;
  }
}

function normalizeHex(hex: string): string {
  const digits = hex.slice(1).toLowerCase();
  return digits.length === 3 ? `#${[...digits].map((d) => d + d).join("")}` : `#${digits}`;
}

/** Lowercases ASCII only, so every index into the result is an index into the original. */
function asciiLower(value: string): string {
  return value.replace(/[A-Z]/g, (letter) => letter.toLowerCase());
}

function isTagEnd(char: string | undefined): boolean {
  return char === undefined || char === ">" || char === "/" || /\s/.test(char);
}

/** Index of the next `<name` tag at or after `from`, or -1. */
function nextTag(lower: string, name: string, from: number): number {
  let at = lower.indexOf(`<${name}`, from);
  while (at !== -1 && !isTagEnd(lower[at + name.length + 1])) {
    at = lower.indexOf(`<${name}`, at + 1);
  }
  return at;
}

/** Every complete `<name ...>` start tag, as raw text. An unclosed tag ends the scan. */
function startTags(html: string, lower: string, name: string): string[] {
  const tags: string[] = [];
  for (let at = nextTag(lower, name, 0); at !== -1; ) {
    const end = lower.indexOf(">", at);
    if (end === -1) break;
    tags.push(html.slice(at, end + 1));
    at = nextTag(lower, name, end + 1);
  }
  return tags;
}

/** The bodies of every complete `<name ...>body</name>` element. An unclosed element ends the scan. */
function elementBodies(html: string, lower: string, name: string): string[] {
  const bodies: string[] = [];
  for (let at = nextTag(lower, name, 0); at !== -1; ) {
    const openEnd = lower.indexOf(">", at);
    const close = openEnd === -1 ? -1 : lower.indexOf(`</${name}`, openEnd + 1);
    if (close === -1) break;
    bodies.push(html.slice(openEnd + 1, close));
    at = nextTag(lower, name, close + name.length + 2);
  }
  return bodies;
}

function frequentColors(html: string, lower: string): string[] {
  const styleTexts = [
    ...elementBodies(html, lower, "style"),
    ...[...html.matchAll(/\sstyle\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)].map((m) => m[1] ?? m[2] ?? ""),
  ];
  const counts = new Map<string, number>();
  for (const css of styleTexts) {
    for (const [hex] of css.matchAll(/#(?:[0-9a-f]{6}|[0-9a-f]{3})(?![0-9a-f])/gi)) {
      const color = normalizeHex(hex);
      counts.set(color, (counts.get(color) ?? 0) + 1);
    }
  }
  // Map keeps first-seen order, and sort is stable, so ties stay in page order.
  return [...counts].sort((a, b) => b[1] - a[1]).slice(0, maxColors).map(([color]) => color);
}

const hiddenElements = ["script", "style", "noscript", "template", "svg", "head"];

/** Where the markup that starts at `at` ends, or -1 when it never closes. */
function skipMarkup(lower: string, at: number): number {
  if (lower.startsWith("<!--", at)) {
    const end = lower.indexOf("-->", at + 4);
    return end === -1 ? -1 : end + 3;
  }
  const hidden = hiddenElements.find(
    (name) => lower.startsWith(`<${name}`, at) && isTagEnd(lower[at + name.length + 1]),
  );
  const close = hidden ? lower.indexOf(`</${hidden}`, at + 1) : at;
  const end = close === -1 ? -1 : lower.indexOf(">", close);
  return end === -1 ? -1 : end + 1;
}

function visibleText(html: string, lower: string): string {
  const parts: string[] = [];
  let length = 0;
  // Collect a margin over the limit, since whitespace collapses after the scan.
  for (let at = 0; at < html.length && length < maxTextChars * 4; ) {
    const tag = html.indexOf("<", at);
    const text = html.slice(at, tag === -1 ? html.length : tag);
    parts.push(text, " ");
    length += text.length;
    if (tag === -1) break;
    at = skipMarkup(lower, tag);
    if (at === -1) break;
  }
  return (clean(parts.join("")) ?? "").slice(0, maxTextChars);
}

export function extractHtmlSignals(html: string, pageUrl: string): HtmlSignals {
  const lower = asciiLower(html);
  const meta = new Map<string, string>();
  for (const tag of startTags(html, lower, "meta")) {
    const attrs = attributes(tag);
    const key = (attrs.name ?? attrs.property)?.toLowerCase();
    if (key && attrs.content !== undefined && !meta.has(key)) meta.set(key, attrs.content);
  }

  const icons: string[] = [];
  for (const tag of startTags(html, lower, "link")) {
    const attrs = attributes(tag);
    const rel = attrs.rel?.toLowerCase().split(/\s+/) ?? [];
    const href = absoluteUrl(attrs.href, pageUrl);
    if (href && rel.some((r) => r.endsWith("icon")) && !icons.includes(href)) icons.push(href);
  }

  const themeColor = clean(meta.get("theme-color"));
  return {
    title: clean(elementBodies(html, lower, "title")[0]),
    description: clean(meta.get("description") ?? meta.get("og:description")),
    themeColor: themeColor && /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(themeColor) ? normalizeHex(themeColor) : undefined,
    ogImage: absoluteUrl(meta.get("og:image"), pageUrl),
    siteName: clean(meta.get("og:site_name")),
    icons,
    text: visibleText(html, lower),
    colors: frequentColors(html, lower),
  };
}
