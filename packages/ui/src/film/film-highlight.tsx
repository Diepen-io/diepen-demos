/**
 * The one element a focus film beat's caption is about. Spread the props on that element in a
 * panel renderer; `styles.css` draws a brand ring around it once the panel has settled.
 *
 *   <div {...highlightProps(ctx, "reply-time")}>Answered in 38 s</div>
 */
export type HighlightProps = { "data-film-highlight": string; "data-highlighted"?: "" };

export function highlightProps(ctx: { highlight?: string }, id: string): HighlightProps {
  return ctx.highlight === id ? { "data-film-highlight": id, "data-highlighted": "" } : { "data-film-highlight": id };
}
