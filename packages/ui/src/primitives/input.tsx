import type { ComponentProps } from "react";
import { cx } from "./class-names";

/** Shared by Input and Textarea. 16px on small screens so iOS Safari does not zoom on focus. */
export const fieldClass = cx(
  "w-full rounded-[10px] bg-surface px-3 text-field text-foreground sm:text-body",
  "shadow-[0_0_0_1px_var(--border)] transition-shadow duration-150",
  "placeholder:text-faint hover:shadow-[0_0_0_1px_#d4d4d8]",
  "focus:shadow-[0_0_0_1px_var(--foreground),0_0_0_4px_rgb(0_0_0/0.06)] focus:outline-none",
  "aria-invalid:shadow-[0_0_0_1px_var(--fail)] disabled:opacity-60",
);

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cx(fieldClass, "h-10 max-sm:h-11", className)} {...props} />;
}
