"use client";

import { useState } from "react";
import { Badge } from "../primitives/badge";
import { Button } from "../primitives/button";
import { Field } from "../primitives/field";
import { Input } from "../primitives/input";
import { contrastGrade, contrastRatio, readableForeground } from "./contrast";

type Colors = { brand: string; brandForeground: string };

const hex = /^#[0-9a-f]{6}$/i;

type ColorInputProps = { label: string; name: string; value: string; onChange: (value: string) => void };

function ColorInput({ label, name, value, onChange }: ColorInputProps) {
  const [text, setText] = useState(value);
  const shown = hex.test(text) ? value : text;
  return (
    <Field label={label} error={hex.test(text) ? undefined : "Use a six digit hex colour like #0f766e"}>
      {(control) => (
        <div className="flex items-center gap-2">
          <input
            type="color"
            name={`${name}-picker`}
            aria-label={`${label} picker`}
            value={value}
            onChange={(event) => {
              setText(event.target.value);
              onChange(event.target.value);
            }}
            className="size-10 shrink-0 cursor-pointer rounded-[10px] max-sm:size-11 border-0 bg-transparent p-0 [&::-webkit-color-swatch]:rounded-[9px] [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch-wrapper]:p-0"
          />
          <Input
            {...control}
            name={name}
            value={shown}
            spellCheck={false}
            className="tabular font-mono uppercase"
            onChange={(event) => {
              setText(event.target.value);
              if (hex.test(event.target.value)) onChange(event.target.value.toLowerCase());
            }}
          />
        </div>
      )}
    </Field>
  );
}

/** Brand and text colour, with a live preview and the WCAG contrast between them. */
export function ColorsField({ value, onChange }: { value: Colors; onChange: (value: Colors) => void }) {
  const ratio = contrastRatio(value.brand, value.brandForeground);
  const grade = ratio === null ? null : contrastGrade(ratio);
  const readable = grade === "AA" || grade === "AAA";
  // Remounting the inputs shows the fixed text colour after "Use readable text".
  const [fixes, setFixes] = useState(0);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <ColorInput label="Brand colour" name="colors.brand" value={value.brand} onChange={(brand) => onChange({ ...value, brand })} />
        <ColorInput
          key={fixes}
          label="Text on brand"
          name="colors.brandForeground"
          value={value.brandForeground}
          onChange={(brandForeground) => onChange({ ...value, brandForeground })}
        />
      </div>
      <div className="flex flex-wrap items-center gap-3 rounded-xl bg-subtle p-3">
        <span
          className="inline-flex h-9 items-center rounded-lg px-3.5 text-body font-medium"
          style={{ backgroundColor: value.brand, color: value.brandForeground }}
        >
          Book a call
        </span>
        {ratio !== null && grade && (
          <span className="flex items-center gap-2 text-meta text-muted">
            <span className="tabular">{ratio.toFixed(1)}:1</span>
            <Badge tone={readable ? "pass" : "fail"} icon={readable ? "check" : "alert"}>
              {readable ? `${grade} contrast` : "Hard to read"}
            </Badge>
          </span>
        )}
        {!readable && (
          <Button
            size="sm"
            variant="secondary"
            className="ml-auto"
            onClick={() => {
              onChange({ ...value, brandForeground: readableForeground(value.brand) });
              setFixes((count) => count + 1);
            }}
          >
            Use readable text
          </Button>
        )}
      </div>
    </div>
  );
}
