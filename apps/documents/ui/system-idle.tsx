import { Icon } from "@diepen/ui/primitives/icon";

/** The system lane before the first file arrives. */
export function SystemIdle() {
  return (
    <p className="flex items-center gap-2.5 px-1 py-2 text-[14px] text-faint">
      <Icon name="clock" size={16} className="shrink-0 text-faint" />
      Waiting for Daniel's files. The chaser checks each file when it arrives.
    </p>
  );
}
