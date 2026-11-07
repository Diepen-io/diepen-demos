import { cx } from "../primitives/class-names";
import { Icon } from "../primitives/icon";

export type ProviderNoteProps = {
  /** The provider the server answered with. The note shows only for "mock". */
  providerName: string;
  className?: string;
};

/** Says the answers are samples when no API key is set. Safe to render from a server component. */
export function ProviderNote({ providerName, className }: ProviderNoteProps) {
  if (providerName !== "mock") return null;
  return (
    <p role="note" className={cx("inline-flex items-center gap-1.5 text-meta text-muted", className)}>
      <Icon name="info" size={15} />
      You see sample answers. The AI is off here.
    </p>
  );
}
