import { Icon } from "@diepen/ui/primitives/icon";

/** The system lane before the first file arrives. */
export function SystemIdle() {
  return (
    <p className="flex items-center gap-2.5 rounded-xl px-3.5 py-3 text-[14px] text-muted shadow-[inset_0_0_0_1px_var(--border)]">
      <Icon name="clock" size={16} className="shrink-0 text-faint" />
      Waiting for Daniel's files. Each one is checked the moment it arrives.
    </p>
  );
}
