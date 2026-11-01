/** Wall-clock ISO times without a zone are read as written, so the result never depends on the viewer. */
function wallTime(iso: string): number {
  return Date.parse(/(?:Z|[+-]\d{2}:?\d{2})$/i.test(iso) ? iso : `${iso}Z`);
}

export function elapsedMs(fromIso: string, toIso: string): number {
  return wallTime(toIso) - wallTime(fromIso);
}

const plural = (count: number, unit: string) => `${count} ${unit}${count === 1 ? "" : "s"}`;

/** "45 seconds", "1 min 12 s", "4 minutes", "3 hours", "2 days". */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  if (totalSeconds < 60) return plural(totalSeconds, "second");
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes < 60) return seconds === 0 ? plural(minutes, "minute") : `${minutes} min ${seconds} s`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return plural(hours, "hour");
  return plural(Math.round(hours / 24), "day");
}
