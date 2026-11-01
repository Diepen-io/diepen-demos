/**
 * The ten key lines of the sample call the film plays, by call time, with the phrases to mark.
 * The phrases hold tokens where the line does, so they are filled with it.
 */
export const filmCallLines: readonly { time: string; highlights: string[] }[] = [
  { time: "00:00", highlights: [] },
  { time: "00:17", highlights: ["14 apartments across three buildings"] },
  { time: "00:44", highlights: ["about nine hours"] },
  { time: "01:00", highlights: ["The night calls are the worst part"] },
  { time: "01:17", highlights: ["38 days on average"] },
  { time: "01:34", highlights: ["roughly 8,700 in rent"] },
  { time: "01:49", highlights: ["chasing them on WhatsApp"] },
  { time: "18:13", highlights: ["{servicePrice}"] },
  { time: "24:30", highlights: ["in writing today"] },
  { time: "27:15", highlights: ["Friday at ten"] },
  { time: "31:46", highlights: ["how the empty days add up"] },
];
