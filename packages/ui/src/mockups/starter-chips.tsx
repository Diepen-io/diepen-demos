export type StarterChipsProps = {
  starters: string[];
  onPick?: (text: string) => void;
};

/** Suggested first messages under an empty thread, so a visitor can start with one click. */
export function StarterChips({ starters, onPick }: StarterChipsProps) {
  return (
    <div className="mt-auto flex flex-col items-end gap-2 pt-6">
      <p className="text-meta text-faint">Try one of these</p>
      {starters.map((starter) => (
        <button
          key={starter}
          type="button"
          disabled={!onPick}
          onClick={() => onPick?.(starter)}
          className="press max-w-full cursor-pointer rounded-2xl bg-surface px-3.5 py-2 text-left text-body text-foreground shadow-[inset_0_0_0_1px_var(--border)] transition-[background-color,box-shadow] duration-150 hover:bg-subtle hover:shadow-[inset_0_0_0_1px_#d4d4d8]"
        >
          {starter}
        </button>
      ))}
    </div>
  );
}
