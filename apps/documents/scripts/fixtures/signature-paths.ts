/**
 * Two hand-drawn signatures as fixed SVG paths, so every build draws the same strokes. Coordinates
 * are in points with y growing downwards, as `drawSvgPath` expects.
 */

/** "M. Ruiz", treasurer of the fictional Elm Street Food Bank. */
export const treasurerSignature =
  "M0 22 C6 2 10 2 12 20 C14 4 18 4 20 22 M26 14 C30 8 32 24 36 18 M40 22 C44 10 50 10 48 22 C58 6 62 26 70 14 C74 8 78 18 84 16 M88 20 C96 12 104 22 112 12";

/** "Priya Shah", HR at the fictional Bramble Freight Ltd. */
export const employerSignature =
  "M0 26 C4 4 16 0 14 12 C12 20 4 18 6 14 M18 24 C22 14 24 14 26 22 C28 16 30 14 34 16 M36 20 C40 10 44 30 48 14 C50 28 56 8 58 22 M66 24 C72 2 84 6 76 18 C70 26 88 26 92 16 C96 8 98 26 104 20 C110 14 116 22 128 12";
