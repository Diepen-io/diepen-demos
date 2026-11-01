"use client";

import { Button } from "@diepen/ui/primitives/button";
import { cx } from "@diepen/ui/primitives/class-names";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import type { LetterSignature } from "./engagement-letter";
import { touchTarget } from "./touch-target";

export type SignaturePadProps = {
  onSign: (signature: LetterSignature) => void;
  /** The typed name as it is being written, so the letter can show it on the signature line. */
  onDraft: (signature: LetterSignature | undefined) => void;
  onCancel: () => void;
};

/** Sign with a finger, the mouse, or a typed name. Signing stays in the browser. */
export function SignaturePad({ onSign, onDraft, onCancel }: SignaturePadProps) {
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

  function startStroke(event: PointerEvent<HTMLCanvasElement>) {
    // A pointer the browser no longer tracks, as from a synthetic touch, cannot be captured. The
    // stroke still draws; it only stops when the pointer leaves the pad.
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Drawing without capture is fine.
    }
    const start = point(event);
    last.current = start;
    path.current.push(`M${Math.round(start.x)} ${Math.round(start.y)}`);
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

  function typeName(value: string) {
    setName(value);
    onDraft(value.trim() ? { kind: "typed", name: value.trim() } : undefined);
  }

  function clear() {
    const element = canvas.current;
    element?.getContext("2d")?.clearRect(0, 0, element.width, element.height);
    path.current = [];
    setHasStroke(false);
    typeName("");
  }

  function switchMode() {
    clear();
    setTyping(!typing);
  }

  function sign() {
    if (typing) onSign({ kind: "typed", name: name.trim() });
    else onSign({ kind: "drawn", progress: 1, path: path.current.join("") });
  }

  return (
    <div ref={pad} className="@container flex scroll-mb-4 flex-col gap-3">
      {typing ? (
        <label className="flex flex-col gap-1.5 text-meta font-medium text-muted">
          Your full name
          <input
            value={name}
            onChange={(event) => typeName(event.target.value)}
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
            onPointerDown={startStroke}
            onPointerMove={draw}
            onPointerUp={() => (last.current = null)}
            onPointerCancel={() => (last.current = null)}
            onPointerLeave={() => (last.current = null)}
          />
          {!hasStroke && (
            <span className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-meta text-faint">Sign here</span>
          )}
        </div>
      )}
      {/* One row where it fits; on a narrow phone two even rows, with Sign at the bottom right. */}
      <div className="grid grid-cols-2 gap-2 @[18.5rem]:flex @[18.5rem]:items-center">
        <Button variant="ghost" size="sm" className={cx(touchTarget, "@[18.5rem]:mr-auto")} onClick={onCancel}>
          Back
        </Button>
        <Button variant="ghost" size="sm" className={touchTarget} disabled={typing ? !name : !hasStroke} onClick={clear}>
          Clear
        </Button>
        <Button variant="secondary" size="sm" className={touchTarget} onClick={switchMode}>
          {typing ? "Draw instead" : "Type your name"}
        </Button>
        <Button variant="brand" size="sm" className={touchTarget} disabled={!ready} onClick={sign}>
          Sign
        </Button>
      </div>
    </div>
  );
}
