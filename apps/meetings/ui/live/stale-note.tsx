import { Button } from "@diepen/ui/primitives/button";
import { spotlight as spotlightOn } from "@diepen/ui/guide/spotlight";
import { Icon } from "@diepen/ui/primitives/icon";

/** Shown over the outputs once the transcript box no longer holds the call they were drafted from. */
export function StaleNote({ onUpdate, disabled, spotlight }: { onUpdate: () => void; disabled: boolean; spotlight?: boolean }) {
  return (
    <div role="status" className="enter flex flex-wrap items-center gap-x-3 gap-y-2 rounded-[14px] bg-wait-soft px-4 py-3 shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--wait)_25%,white)]">
      <Icon name="info" size={17} className="shrink-0 text-wait" />
      <p className="min-w-0 flex-1 text-[14px] leading-snug">You changed the call. These drafts belong to the earlier version.</p>
      <Button variant="secondary" size="sm" className="max-sm:h-11" onClick={onUpdate} disabled={disabled} {...spotlightOn(spotlight)}>
        Draft again
      </Button>
    </div>
  );
}
