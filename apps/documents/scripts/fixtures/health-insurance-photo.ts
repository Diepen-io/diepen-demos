import { Resvg } from "@resvg/resvg-js";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

/**
 * The one image sample: a phone photo of a letter from a fictional insurer. An SVG of the letter,
 * slightly turned on a grey desk, rendered with the bundled Geist fonts only, so every machine
 * produces the same pixels.
 */

// The geist package exports only its JavaScript entry; its font files sit next to it.
const fontFolder = join(dirname(createRequire(import.meta.url).resolve("geist/font/sans")), "fonts", "geist-sans");
const fontFile = (name: string) => join(fontFolder, name);

const width = 1240;
const height = 1654;
const ink = "#1c1c1f";
const grey = "#6b6b72";

function row(y: number, label: string, value: string, bold = false): string {
  const weight = bold ? 600 : 400;
  return [
    `<text x="96" y="${y}" font-size="30" font-weight="${weight}" fill="${ink}">${label}</text>`,
    `<text x="1004" y="${y}" font-size="30" font-weight="${weight}" fill="${ink}" text-anchor="end">${value}</text>`,
    `<line x1="96" y1="${y + 18}" x2="1004" y2="${y + 18}" stroke="#d9d7d0" stroke-width="2"/>`,
  ].join("");
}

const letter = [
  `<rect width="1100" height="1480" fill="#f6f3ec"/>`,
  `<rect width="1100" height="16" fill="#0f766e"/>`,
  `<text x="96" y="130" font-size="44" font-weight="600" fill="#0f766e">Lindgren Health</text>`,
  `<text x="96" y="172" font-size="24" fill="${grey}">Member services, 9 Harbour Gate, 00000 Exampletown. A fictional insurer</text>`,
  `<text x="96" y="270" font-size="30" font-weight="600" fill="${ink}">Daniel Okafor</text>`,
  `<text x="96" y="310" font-size="30" fill="${ink}">14 Sample Street, 00000 Exampletown</text>`,
  `<text x="96" y="430" font-size="50" font-weight="600" fill="${ink}">Statement of premiums paid 2025</text>`,
  `<text x="96" y="480" font-size="28" fill="${grey}">For your tax return. Covers 1 Jan 2025 to 31 Dec 2025</text>`,
  row(590, "Member", "Daniel Okafor"),
  row(660, "Member number", "SAMPLE-ID 00 000 000 001"),
  row(730, "Plan", "Basic cover, single"),
  row(800, "Monthly premium", "EUR 247.00"),
  row(870, "Premiums paid 2025", "EUR 2,964.00", true),
  `<text x="96" y="990" font-size="28" fill="${ink}">Lindgren Health received all 12 premiums for 2025.</text>`,
  `<text x="550" y="980" font-size="250" font-weight="700" fill="#c81e1e" fill-opacity="0.1" text-anchor="middle" transform="rotate(-35 550 980)">SAMPLE</text>`,
  `<line x1="96" y1="1390" x2="1004" y2="1390" stroke="#d9d7d0" stroke-width="2"/>`,
  `<text x="96" y="1430" font-size="22" fill="${grey}">Sample document for the diepen.ai demo. Fictional person and numbers.</text>`,
  `<text x="1004" y="1430" font-size="22" fill="${grey}" text-anchor="end">Page 1 of 1</text>`,
].join("");

const svg = [
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="Geist">`,
  `<rect width="${width}" height="${height}" fill="#8d9096"/>`,
  `<g transform="rotate(0.6 620 827) translate(70 86)">`,
  `<rect x="10" y="14" width="1100" height="1480" fill="#6f7277"/>`,
  letter,
  `</g></svg>`,
].join("");

export function healthInsurancePhoto(): Uint8Array {
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: width },
    font: {
      loadSystemFonts: false,
      fontFiles: [fontFile("Geist-Regular.ttf"), fontFile("Geist-SemiBold.ttf"), fontFile("Geist-Bold.ttf")],
      defaultFontFamily: "Geist",
    },
  });
  return new Uint8Array(resvg.render().asPng());
}
