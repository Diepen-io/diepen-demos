"use client";

import { useUrlParam } from "./url-param";

/**
 * True with `?record=1`. The shell then hides its top bar and footer, and the film hides its
 * controls, so a 1920x1080 recording shows only the demo.
 */
export function useRecordMode(): boolean {
  return useUrlParam("record") === "1";
}
