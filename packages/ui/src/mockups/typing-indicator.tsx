import type { CSSProperties } from "react";
import { cx } from "../primitives/class-names";

export type TypingIndicatorProps = {
  /** Read by screen readers, for example "Mia is typing". */
  label: string;
  className?: string;
  style?: CSSProperties;
};

/** Three dots in a bubble. The bubble colour comes from the caller so it matches each channel. */
export function TypingIndicator({ label, className, style }: TypingIndicatorProps) {
  return (
    <span role="status" aria-label={label} style={style} className={cx("enter inline-flex items-center gap-1 px-4 py-3.5", className)}>
      {[0, 1, 2].map((dot) => (
        <span
          key={dot}
          aria-hidden="true"
          className="typing-dot size-[7px] rounded-full bg-current"
          style={{ animationDelay: `${dot * 160}ms` }}
        />
      ))}
    </span>
  );
}
