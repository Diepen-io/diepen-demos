import { cx } from "../primitives/class-names";
import { Icon } from "../primitives/icon";

export type FallbackNoteProps = {
  /** A link to the film. Leave it out on the film page itself. */
  filmHref?: string;
  onDismiss?: () => void;
  className?: string;
};

/** Shown when a live request tripped a cost guard and the app sent the visitor to the film. */
export function FallbackNote({ filmHref, onDismiss, className }: FallbackNoteProps) {
  return (
    <div role="status" className={cx("flex items-center gap-3 rounded-xl bg-wait-soft px-4 py-3 text-sm text-wait", className)}>
      <Icon name="clock" size={16} className="shrink-0" />
      <p className="min-w-0 flex-1 text-foreground">
        {filmHref ? "Live answers are paused for now. " : "Live answers are paused for now. Here is the film."}
        {filmHref && (
          <a href={filmHref} className="font-medium underline decoration-1 underline-offset-[3px] hover:decoration-2">
            Watch the film
          </a>
        )}
      </p>
      {onDismiss && (
        <button
          type="button"
          aria-label="Dismiss"
          onClick={onDismiss}
          className="press -my-1 -mr-1.5 inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-wait hover:bg-[color-mix(in_oklab,var(--wait)_12%,transparent)]"
        >
          <Icon name="close" size={16} />
        </button>
      )}
    </div>
  );
}
