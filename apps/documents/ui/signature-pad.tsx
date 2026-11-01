"use client";

import { Button } from "@diepen/ui/primitives/button";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import type { LetterSignature } from "./engagement-letter";

export type SignaturePadProps = {
  onSign: (signature: LetterSignature) => void;
  onCancel: () => void;
};

/** Sign with a finger, the mouse, or a typed name. Signing stays in the browser. */
export function SignaturePad({ onSign, onCancel }: SignaturePadProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const last = useRef<{ x: number; y: number } | null>(null);
  const path = useRef<string[]>([]);
  const [hasStroke, setHasStroke] = useState(false);
  const [typing, setTyping] = useState(false);
  const [name, setName] = useState("");
  const ready = typing ? name.trim().length > 1 : hasStroke;
  const pad = useRef<HTMLDivElement>(null);

  // The letter is longer than a phone screen; the place to sign comes into view on its own.
  useEffect(() => {
    const frame = requestAnimationFrame(() => pad.current?.scrollIntoView({ block: "end", behavior: "instant" }));
    return () => cancelAnimationFrame(frame);
  }, []);

  function point(event: PointerEvent<HTMLCanvasElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    return { x: ((event.clientX - box.left) / box.width) * event.currentTarget.width, y: ((event.clientY - box.top) / box.height) * event.currentTarget.height };
  }

  function draw(event: PointerEvent<HTMLCanvasElement>) {
    const from = last.current;
    const context = canvas.current?.getContext("2d");
    if (!from || !context) return;
    const to = point(event);
    context.lineWidth = 3;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "#171717";
    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(to.x, to.y);
    context.stroke();
    path.current.push(`L${Math.round(to.x)} ${Math.round(to.y)}`);
    last.current = to;
    setHasStroke(true);
  }

  function clear() {
    const element = canvas.current;
    element?.getContext("2d")?.clearRect(0, 0, element.width, element.height);
    path.current = [];
    setHasStroke(false);
  }

  function sign() {
    if (typing) onSign({ kind: "typed", name: name.trim() });
    else onSign({ kind: "drawn", progress: 1, path: path.current.join("") });
  }

  return (
    <div ref={pad} className="flex scroll-mb-4 flex-col gap-3">
      {typing ? (
        <label className="flex flex-col gap-1.5 text-meta font-medium text-muted">
          Your full name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            className="h-11 rounded-lg bg-surface px-3 text-[16px] text-foreground shadow-[inset_0_0_0_1px_var(--border)] focus-visible:shadow-[inset_0_0_0_1.5px_var(--foreground)] focus-visible:outline-none"
          />
        </label>
      ) : (
        <div className="relative">
          <canvas
            ref={canvas}
            width={640}
            height={220}
            aria-label="Sign here"
            role="img"
            className="block h-[110px] w-full cursor-crosshair touch-none rounded-lg bg-subtle shadow-[inset_0_0_0_1px_var(--border)]"
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              const start = point(event);
              last.current = start;
              path.current.push(`M${Math.round(start.x)} ${Math.round(start.y)}`);
            }}
            onPointerMove={draw}
            onPointerUp={() => (last.current = null)}
            onPointerCancel={() => (last.current = null)}
          />
          {!hasStroke && (
            <span className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-meta text-faint">Sign here</span>
          )}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="brand" size="sm" disabled={!ready} onClick={sign}>
          Sign
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (typing) setTyping(false);
            else setTyping(true);
            clear();
            setName("");
          }}
        >
          {typing ? "Draw instead" : "Type your name instead"}
        </Button>
        {!typing && hasStroke && (
          <Button variant="ghost" size="sm" onClick={clear}>
            Clear
          </Button>
        )}
        <Button variant="ghost" size="sm" className="ml-auto" onClick={onCancel}>
          Back
        </Button>
      </div>
    </div>
  );
}
