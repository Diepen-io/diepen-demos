import { cx } from "@diepen/ui/primitives/class-names";
import { Icon, type IconName } from "@diepen/ui/primitives/icon";

export type LivePart = "customer" | "owner" | "calendar";

const parts: { id: LivePart; label: string; icon: IconName }[] = [
  { id: "customer", label: "Customer", icon: "chat" },
  { id: "owner", label: "Owner view", icon: "user" },
  { id: "calendar", label: "Calendar", icon: "calendar" },
];

export type LivePartTabsProps = {
  value: LivePart;
  onChange: (part: LivePart) => void;
  /** Parts that changed while hidden get a dot. */
  changed: Partial<Record<LivePart, boolean>>;
};

/** Below 768 px live mode shows one part at a time; this bar at the bottom switches between them. */
export function LivePartTabs({ value, onChange, changed }: LivePartTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Live demo parts"
      className="fixed inset-x-0 bottom-0 z-40 flex gap-1 border-t border-border bg-surface/95 px-3 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden"
    >
      {parts.map((part) => {
        const active = part.id === value;
        return (
          <button
            key={part.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(part.id)}
            className={cx(
              "relative flex h-14 flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl text-[12px] font-medium transition-colors duration-150",
              active ? "text-foreground" : "text-faint",
            )}
          >
            <Icon name={part.icon} size={20} className={active ? "text-brand" : undefined} />
            {part.label}
            {changed[part.id] && !active ? (
              <span className="absolute top-2 right-[calc(50%-1.1rem)] size-2 rounded-full bg-brand" aria-label="Updated" role="img" />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
