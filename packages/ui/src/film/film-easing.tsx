/**
 * The curves from `styles.css` (`--ease-out`, `--ease-in-out`) in the forms JavaScript animation needs:
 * a CSS string for the Web Animations API, control points for motion, and a solver for frame math.
 */
export const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";
export const EASE_OUT_POINTS = [0.23, 1, 0.32, 1] as const;
export const EASE_IN_OUT_POINTS = [0.77, 0, 0.175, 1] as const;

/** Returns y for x on a CSS cubic-bezier curve, solved with Newton steps and a bisection fallback. */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number): (x: number) => number {
  const at = (a: number, b: number, s: number) => 3 * a * s * (1 - s) ** 2 + 3 * b * s * s * (1 - s) + s ** 3;
  const slope = (a: number, b: number, s: number) =>
    3 * a * (1 - s) ** 2 + 6 * (b - a) * s * (1 - s) + 3 * (1 - b) * s * s;
  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let s = x;
    for (let step = 0; step < 6; step++) {
      const d = slope(x1, x2, s);
      if (Math.abs(d) < 1e-6) break;
      s -= (at(x1, x2, s) - x) / d;
    }
    if (s < 0 || s > 1 || Math.abs(at(x1, x2, s) - x) > 1e-4) {
      let low = 0;
      let high = 1;
      s = x;
      for (let step = 0; step < 30; step++) {
        if (at(x1, x2, s) < x) low = s;
        else high = s;
        s = (low + high) / 2;
      }
    }
    return at(y1, y2, s);
  };
}

export const easeInOut = cubicBezier(...EASE_IN_OUT_POINTS);
export const easeOut = cubicBezier(...EASE_OUT_POINTS);
