const hexPattern = /^#([0-9a-f]{6})$/i;

function channel(value: number): number {
  const srgb = value / 255;
  return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
}

/** WCAG relative luminance of a six-digit hex colour, or null when the value is not one. */
export function relativeLuminance(hex: string): number | null {
  const match = hexPattern.exec(hex.trim());
  if (!match?.[1]) return null;
  const n = Number.parseInt(match[1], 16);
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
}

/** WCAG contrast ratio between two hex colours, from 1 to 21. Null when either is not a hex colour. */
export function contrastRatio(a: string, b: string): number | null {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  if (la === null || lb === null) return null;
  const [light, dark] = la > lb ? [la, lb] : [lb, la];
  return (light + 0.05) / (dark + 0.05);
}

export type ContrastGrade = "AAA" | "AA" | "AA large" | "Fail";

/** Brand buttons and headers carry normal-size text, so AA means 4.5:1 here. */
export function contrastGrade(ratio: number): ContrastGrade {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "AA large";
  return "Fail";
}

/** White or near black, whichever reads better on the given background. */
export function readableForeground(background: string): "#ffffff" | "#171717" {
  const onWhite = contrastRatio(background, "#ffffff") ?? 0;
  const onBlack = contrastRatio(background, "#171717") ?? 0;
  return onWhite >= onBlack ? "#ffffff" : "#171717";
}
