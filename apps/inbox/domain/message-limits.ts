/** The longest message a visitor can type. The composer stops there and the route refuses more. */
export const maxCustomerMessageChars = 1000;

/**
 * The longest earlier answer the route reads back. An email answer can pass the customer limit,
 * and live mode sends every answer back with the next turn, so answers get their own, higher limit.
 */
export const maxAssistantMessageChars = 2000;

/** An earlier answer as live mode sends it back: clipped, so an unusually long one never blocks the thread. */
export function clipAssistantText(text: string): string {
  return text.length > maxAssistantMessageChars ? text.slice(0, maxAssistantMessageChars) : text;
}
