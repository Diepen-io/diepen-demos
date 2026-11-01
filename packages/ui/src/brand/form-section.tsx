import type { ReactNode } from "react";

export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-4 border-t border-border pt-5">
      <legend className="float-left mb-1 w-full text-sm font-semibold text-foreground">{title}</legend>
      {children}
    </fieldset>
  );
}
