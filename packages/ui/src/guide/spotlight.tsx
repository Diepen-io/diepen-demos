/**
 * Marks the one element the live guide points at. The ring lives in styles.css, and `GuideBar`
 * scrolls the marked element into view when the step changes.
 */
export type SpotlightAttributes = { "data-spotlight"?: "outside" | "inset" };

/**
 * `inset` draws the ring inside the element, for a full-width row whose container clips
 * anything drawn outside it.
 */
export function spotlight(active: boolean | undefined, placement: "outside" | "inset" = "outside"): SpotlightAttributes {
  return active ? { "data-spotlight": placement } : {};
}
