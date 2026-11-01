/** An item that changed this recently, in film ms, plays its entrance. Older ones, reached by a seek, just appear. */
const freshMs = 700;

export function isFresh(since: number | undefined, t: number | undefined): boolean {
  return since !== undefined && t !== undefined && t - since < freshMs;
}
