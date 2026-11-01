/** Where the pointer is on its way to a click: 0 far away, 1 on target. `pressed` shrinks it for the click. */
export type CursorState = { progress: number; pressed: boolean };

/**
 * A pointer that moves in from the lower right and clicks. Its place is a pure function of film
 * time, like everything in the film, so a pause or a seek shows the same frame.
 */
export function FilmCursor({ progress, pressed }: CursorState) {
  const eased = 1 - (1 - progress) ** 3;
  const x = (1 - eased) * 140;
  const y = (1 - eased) * 180;
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute top-9 right-[22%] z-20 will-change-transform"
      style={{ transform: `translate3d(${x}px, ${y}px, 0) scale(${pressed ? 0.86 : 1})`, opacity: Math.min(1, progress * 4) }}
    >
      <svg width="26" height="30" viewBox="0 0 26 30" fill="none">
        <path d="M3 2.5v21.8l6-5.6 4 9.1 4-1.8-4-8.9 8.4-.2z" fill="#171717" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
      </svg>
      {pressed ? <span className="absolute -top-2 -left-2 size-7 rounded-full bg-foreground/15" /> : null}
    </span>
  );
}
