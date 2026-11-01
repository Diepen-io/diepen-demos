import { useId, type ReactNode } from "react";

type FieldControlProps = { id: string; "aria-describedby"?: string; "aria-invalid"?: boolean };

export type FieldProps = {
  label: string;
  hint?: string;
  error?: string;
  /** Receives the ids that tie the control to its label, hint and error. */
  children: (control: FieldControlProps) => ReactNode;
};

export function Field({ label, hint, error, children }: FieldProps) {
  const id = useId();
  const noteId = hint || error ? `${id}-note` : undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-medium text-foreground">
        {label}
      </label>
      {children({ id, "aria-describedby": noteId, "aria-invalid": error ? true : undefined })}
      {(error ?? hint) && (
        <p id={noteId} className={error ? "text-[13px] text-fail" : "text-[13px] text-faint"}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
}
