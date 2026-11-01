import { Button } from "../primitives/button";
import { Icon } from "../primitives/icon";

export type HandoverNoteProps = {
  /** For example "Handed to Dr. Lena Okafor. She replies here." */
  note: string;
  onStartOver?: () => void;
};

/** Takes the composer's place once a person owns the conversation. */
export function HandoverNote({ note, onStartOver }: HandoverNoteProps) {
  return (
    <div className="enter flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-border bg-wait-soft px-4 py-3">
      <Icon name="user" size={18} className="shrink-0 text-wait" />
      <p role="status" className="min-w-0 flex-1 text-body text-foreground">
        {note}
      </p>
      {onStartOver && (
        <Button variant="secondary" size="sm" onClick={onStartOver}>
          Start over
        </Button>
      )}
    </div>
  );
}
