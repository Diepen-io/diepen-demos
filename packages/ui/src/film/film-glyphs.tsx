import type { ReactNode, SVGProps } from "react";

/**
 * Player glyphs the film controls need and the shared icon set does not have.
 * Same grid, stroke and caps as `primitives/icon`, so they sit in one family.
 */
const glyphs = {
  play: <path d="M7.5 5.2v13.6a.8.8 0 0 0 1.2.7l10.6-6.8a.8.8 0 0 0 0-1.4L8.7 4.5a.8.8 0 0 0-1.2.7z" fill="currentColor" />,
  pause: (
    <>
      <rect x="6.5" y="5" width="3.6" height="14" rx="1" fill="currentColor" stroke="none" />
      <rect x="13.9" y="5" width="3.6" height="14" rx="1" fill="currentColor" stroke="none" />
    </>
  ),
  replay: (
    <>
      <path d="M4 4.5v5h5" />
      <path d="M4.6 14.5A8 8 0 1 0 6 7.2L4 9.5" />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type FilmGlyphName = keyof typeof glyphs;

export function FilmGlyph({
  name,
  size = 18,
  ...props
}: Omit<SVGProps<SVGSVGElement>, "name"> & { name: FilmGlyphName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {glyphs[name]}
    </svg>
  );
}
