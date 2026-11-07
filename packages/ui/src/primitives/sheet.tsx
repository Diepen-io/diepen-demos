"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Icon } from "./icon";

const exitMs = 200;
const focusable =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export type SheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  /** Sticks to the bottom of the panel, for the actions. */
  footer?: ReactNode;
};

/**
 * A side panel that slides in from the right. It traps focus, closes on Escape and on the
 * backdrop, locks page scroll and gives focus back to the control that opened it.
 */
export function Sheet({ open, onClose, title, description, children, footer }: SheetProps) {
  const [present, setPresent] = useState(open);
  if (open && !present) setPresent(true);

  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (open || !present) return;
    const timer = setTimeout(() => setPresent(false), exitMs);
    return () => clearTimeout(timer);
  }, [open, present]);

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const { overflow, paddingRight } = document.body.style;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    const first = panel.current?.querySelector<HTMLElement>(focusable);
    (first ?? panel.current)?.focus();
    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
      opener?.focus();
    };
  }, [open]);

  if (!present) return null;

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== "Tab" || !panel.current) return;
    const items = [...panel.current.querySelectorAll<HTMLElement>(focusable)];
    const first = items[0];
    const last = items[items.length - 1];
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  const state = open ? "open" : "closing";
  return (
    <div className="fixed inset-0 z-50">
      <div
        aria-hidden="true"
        data-state={state}
        onClick={onClose}
        className="sheet-backdrop absolute inset-0 bg-[rgb(10_10_10/0.32)]"
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        data-state={state}
        onKeyDown={onKeyDown}
        className="sheet-panel absolute inset-y-0 right-0 flex w-full max-w-[34rem] flex-col bg-surface shadow-[-24px_0_48px_-16px_rgb(0_0_0/0.18)] focus:outline-none sm:rounded-l-[18px]"
      >
        {/* Plain divs: a header or footer here would add a second banner and contentinfo to the page. */}
        <div className="flex items-start gap-4 px-5 pt-5 pb-4 sm:px-6">
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-title font-semibold tracking-[-0.01em]">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-1 text-body text-muted">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="press -mr-1.5 inline-flex size-11 shrink-0 cursor-pointer sm:size-9 items-center justify-center rounded-lg text-muted hover:bg-subtle hover:text-foreground"
          >
            <Icon name="close" size={18} />
          </button>
        </div>
        <div className="scroll-area min-h-0 flex-1 overflow-y-auto px-5 pb-6 sm:px-6">{children}</div>
        {footer && (
          <div className="border-t border-border bg-surface px-5 py-3 sm:px-6 sm:rounded-bl-[18px]">{footer}</div>
        )}
      </div>
    </div>
  );
}
