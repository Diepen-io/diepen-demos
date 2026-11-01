import { Avatar } from "../primitives/avatar";
import { StatusBadge, type DocumentStatus } from "../primitives/badge";
import { cx } from "../primitives/class-names";
import { ChannelFrame } from "./channel-frame";

export type ChecklistItem = {
  id: string;
  name: string;
  /** What exactly is needed, for example "2025, all pages, signed". */
  detail?: string;
  status: DocumentStatus;
  /** What the check found. Shown in red for a problem. */
  note?: string;
  isNew?: boolean;
};

export type ChecklistProps = {
  client: { name: string; detail?: string };
  /** What the documents are for, for example "Tax return 2025". */
  title: string;
  items: ChecklistItem[];
  className?: string;
};

const segmentColor: Record<DocumentStatus, string> = {
  checked: "bg-pass",
  received: "bg-[#a1a1aa]",
  problem: "bg-fail",
  missing: "bg-border",
};

/** The business's view of one client: every requested document and where it stands. */
export function Checklist({ client, title, items, className }: ChecklistProps) {
  const checked = items.filter((item) => item.status === "checked").length;
  return (
    <ChannelFrame channel="Checklist" icon="check" accent="var(--foreground)" meta={title} className={className}>
      <header className="flex flex-col gap-3 border-b border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <Avatar name={client.name} size={40} />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-[17px] font-semibold tracking-[-0.01em]">{client.name}</h3>
            {client.detail && <p className="truncate text-meta text-muted">{client.detail}</p>}
          </div>
          <p className="tabular shrink-0 text-meta text-muted">
            <span className="text-[17px] font-semibold text-foreground">{checked}</span> of {items.length} checked
          </p>
        </div>
        <div aria-hidden="true" className="flex gap-1">
          {items.map((item) => (
            <span key={item.id} className={cx("h-1.5 flex-1 rounded-full transition-colors duration-300", segmentColor[item.status])} />
          ))}
        </div>
      </header>
      <ul className="scroll-area min-h-0 flex-1 overflow-y-auto">
        {items.map((item) => (
          <li
            key={item.id}
            className={cx("flex flex-col gap-2 border-b border-border px-4 py-3 @md:flex-row @md:items-start @md:gap-4", item.isNew && "enter")}
          >
            <div className="min-w-0 flex-1">
              <p className="text-body font-medium text-foreground">{item.name}</p>
              {item.detail && <p className="text-meta text-muted">{item.detail}</p>}
              {item.note && <p className={cx("mt-1 text-meta", item.status === "problem" ? "text-fail" : "text-muted")}>{item.note}</p>}
            </div>
            <StatusBadge status={item.status} className="self-start" />
          </li>
        ))}
      </ul>
    </ChannelFrame>
  );
}
