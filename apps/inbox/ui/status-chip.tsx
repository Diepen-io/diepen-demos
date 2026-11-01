import { StatusBadge, type BadgeSize } from "@diepen/ui/primitives/badge";
import type { ConversationStatus } from "@/domain/conversation-status";

/** The status of a conversation in the owner's words. Semantic colours, never the brand. */
export function StatusChip({ status, size, className }: { status: ConversationStatus; size?: BadgeSize; className?: string }) {
  return (
    <span data-testid="status-chip" className="inline-flex">
      <StatusBadge status={status} size={size} className={className} />
    </span>
  );
}
