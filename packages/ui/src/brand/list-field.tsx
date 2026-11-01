"use client";

import { useState } from "react";
import { Field } from "../primitives/field";
import { Input } from "../primitives/input";
import { Textarea } from "../primitives/textarea";

export type ListFieldProps = {
  label: string;
  hint?: string;
  value: string[];
  onChange: (value: string[]) => void;
  /** "line" edits one item per line, "comma" a short comma separated list. */
  separator: "line" | "comma";
  placeholder?: string;
};

function parse(text: string, separator: ListFieldProps["separator"]): string[] {
  return text
    .split(separator === "line" ? "\n" : ",")
    .map((item) => item.trim())
    .filter(Boolean);
}

/** Keeps the raw text while typing, so a trailing comma or an empty new line survives. */
export function ListField({ label, hint, value, onChange, separator, placeholder }: ListFieldProps) {
  const [text, setText] = useState(() => value.join(separator === "line" ? "\n" : ", "));
  const update = (next: string) => {
    setText(next);
    onChange(parse(next, separator));
  };
  return (
    <Field label={label} hint={hint ?? (separator === "line" ? "One per line" : "Separate with commas")}>
      {(control) =>
        separator === "line" ? (
          <Textarea {...control} rows={3} value={text} placeholder={placeholder} onChange={(event) => update(event.target.value)} />
        ) : (
          <Input {...control} value={text} placeholder={placeholder} onChange={(event) => update(event.target.value)} />
        )
      }
    </Field>
  );
}
