"use client";

import { useSyncExternalStore } from "react";
import { localNow } from "./reply-client";

const noUpdates = () => () => {};

/**
 * The visitor's local time to the minute, or null while the server renders. The calendar is drawn
 * from the visitor's clock, so the server must not guess it.
 */
export function useVisitorNow(): string | null {
  return useSyncExternalStore(noUpdates, () => localNow(), () => null);
}
