/**
 * The brand signals in one HTML page. Pure and regex-based: the input is a single fetched page
 * and the output feeds a model that tolerates the odd miss, so a full DOM parser is not worth it.
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

function frequentColors(html: string): string[] {
  const styleTexts = [
    ...[...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1] ?? ""),
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

function visibleText(html: string): string {
  const text = html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|noscript|template|svg|head)\b[\s\S]*?<\/\1\s*>/gi, " ")
    .replace(/<[^>]+>/g, " ");
  return (clean(text) ?? "").slice(0, maxTextChars);
}

export function extractHtmlSignals(html: string, pageUrl: string): HtmlSignals {
  const meta = new Map<string, string>();
  for (const [tag] of html.matchAll(/<meta\b[^>]*>/gi)) {
    const attrs = attributes(tag);
    const key = (attrs.name ?? attrs.property)?.toLowerCase();
    if (key && attrs.content !== undefined && !meta.has(key)) meta.set(key, attrs.content);
  }

  const icons: string[] = [];
  for (const [tag] of html.matchAll(/<link\b[^>]*>/gi)) {
    const attrs = attributes(tag);
    const rel = attrs.rel?.toLowerCase().split(/\s+/) ?? [];
    const href = absoluteUrl(attrs.href, pageUrl);
    if (href && rel.some((r) => r.endsWith("icon")) && !icons.includes(href)) icons.push(href);
  }

  const themeColor = clean(meta.get("theme-color"));
  return {
    title: clean(/<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1]),
    description: clean(meta.get("description") ?? meta.get("og:description")),
    themeColor: themeColor && /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(themeColor) ? normalizeHex(themeColor) : undefined,
    ogImage: absoluteUrl(meta.get("og:image"), pageUrl),
    siteName: clean(meta.get("og:site_name")),
    icons,
    text: visibleText(html),
    colors: frequentColors(html),
  };
}
