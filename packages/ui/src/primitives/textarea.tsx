import type { ComponentProps } from "react";
import { cx } from "./class-names";
import { fieldClass } from "./input";

export function Textarea({ className, rows = 3, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea rows={rows} className={cx(fieldClass, "resize-y py-2 leading-snug", className)} {...props} />
  );
}
