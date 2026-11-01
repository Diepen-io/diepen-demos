/** WCAG contrast, used to pick text that stays readable on a brand colour from any website. */

const lightText = "#ffffff";
const darkText = "#111111";

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
}

export function contrastRatio(a: string, b: string): number {
  const [light, dark] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x) as [number, number];
  return (light + 0.05) / (dark + 0.05);
}

/** White or near-black, whichever reads better on `brand` (a six-digit hex colour). */
export function readableForeground(brand: string): string {
  return contrastRatio(brand, lightText) >= contrastRatio(brand, darkText) ? lightText : darkText;
}
