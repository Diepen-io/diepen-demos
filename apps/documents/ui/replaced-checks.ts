/**
 * A check card is replaced once a later upload of the same item passed, the same moment its file
 * moves to "99 Replaced" in Drive. The system lane then shrinks it to its file name.
 */
export function replacedChecks<T>(
  checks: readonly T[],
  itemOf: (check: T) => string | undefined,
  passed: (check: T) => boolean,
): Set<T> {
  const replaced = new Set<T>();
  checks.forEach((check, index) => {
    const item = itemOf(check);
    if (item !== undefined && checks.slice(index + 1).some((later) => itemOf(later) === item && passed(later))) replaced.add(check);
  });
  return replaced;
}
