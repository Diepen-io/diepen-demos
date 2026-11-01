/**
 * The example month behind the film's end number (decision N3): a fictional firm with 40 tax
 * returns, 3 chases of 6 minutes each per return, against 1.5 minutes per return to read the
 * summary. Arithmetic on an example, so it claims nothing about a real firm.
 */
export const exampleMonth = { returns: 40, chasesPerReturn: 3, minutesPerChase: 6, minutesPerSummary: 1.5 } as const;

export type ChaseMonth = { returns: number; chasesPerReturn: number; minutesPerChase: number; minutesPerSummary: number };

/** Hours a month the firm spends chasing documents by hand. */
export function chasingHoursBefore(month: ChaseMonth = exampleMonth): number {
  return (month.returns * month.chasesPerReturn * month.minutesPerChase) / 60;
}

/** Hours a month the firm spends reading the summaries once the chaser runs. */
export function chasingHoursAfter(month: ChaseMonth = exampleMonth): number {
  return (month.returns * month.minutesPerSummary) / 60;
}

/** "12 h", or "0.5 h" for part of an hour. */
export function formatHours(hours: number): string {
  return `${Math.round(hours * 10) / 10} h`;
}
