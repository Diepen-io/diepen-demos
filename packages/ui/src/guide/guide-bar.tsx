"use client";

import { useEffect } from "react";
import { useBrand } from "../brand/brand-provider";
import { usePrefersReducedMotion } from "../film/use-stage-environment";
import { Button, buttonClassName } from "../primitives/button";
import { cx } from "../primitives/class-names";
import { Icon, type IconName } from "../primitives/icon";

/** A button in the guide. With `href` it is a link, for example to the film. */
export type GuideAction = {
  label: string;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  icon?: IconName;
};

/** One step of a live demo's guided path. Each app works out its current step from its own state. */
export type GuideStep = {
  /** Changes when the step changes. The bar then scrolls the spotlight into view. */
  id: string;
  /** The place in the path, from 1. Leave it out at the end. */
  number?: number;
  total: number;
  /** One or two short sentences that say what to do now. */
  text: string;
  /** The next action, as one large button in the middle. Leave it out when the spotlight points at the element to use. */
  action?: GuideAction;
  /** Marks the end of the path: the bar offers "Start over", and "Watch the film" as a quieter second choice. */
  onStartOver?: () => void;
  /** The demo works and the visitor waits. The bar says so in place of a button. */
  waiting?: boolean;
};

export type GuideBarProps = {
  step: GuideStep;
  /** On a page that scrolls, the bar stays at the top, so the instruction stays next to the spotlight. */
  sticky?: boolean;
  className?: string;
};

function ActionButton({ action, primary }: { action: GuideAction; primary: boolean }) {
  const variant = primary ? "brand" : "ghost";
  const content = (
    <>
      {action.icon && <Icon name={action.icon} size={18} />}
      {action.label}
    </>
  );
  if (action.href) {
    return (
      <a href={action.href} className={buttonClassName(variant, "lg", "min-h-11")}>
        {content}
      </a>
    );
  }
  return (
    <Button variant={variant} size="lg" className="min-h-11" onClick={action.onClick} disabled={action.disabled}>
      {content}
    </Button>
  );
}

/** In place of a button: where to look, or that the demo is busy. */
function Hint({ waiting }: { waiting?: boolean }) {
  return (
    <p className="flex items-center gap-2 text-[15px] text-muted">
      {waiting ? (
        <>
          <span aria-hidden="true" className="inline-flex gap-1">
            {[0, 1, 2].map((dot) => (
              <span key={dot} className="typing-dot size-1.5 rounded-full bg-brand" style={{ animationDelay: `${dot * 150}ms` }} />
            ))}
          </span>
          One moment
        </>
      ) : (
        <>
          <span aria-hidden="true" className="size-3 rounded-full outline-2 outline-offset-2 outline-brand" />
          Find the ring
        </>
      )}
    </p>
  );
}

/**
 * The live guide: what to do now, in one place, with one large button or a spotlight on the one
 * element to use. At the end it offers to start over or to watch the film.
 */
export function GuideBar({ step, sticky, className }: GuideBarProps) {
  const reducedMotion = usePrefersReducedMotion();
  const { hrefWithBrand } = useBrand();
  const primary = step.onStartOver ? { label: "Start over", onClick: step.onStartOver } : step.action;
  const secondary = step.onStartOver ? { label: "Watch the film", href: hrefWithBrand("/"), icon: "play" as const } : undefined;

  useEffect(() => {
    const target = document.querySelector<HTMLElement>("[data-spotlight]");
    target?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: reducedMotion ? "auto" : "smooth" });
  }, [step.id, reducedMotion]);

  return (
    <section
      aria-label="Next step"
      data-guide-step={step.id}
      className={cx(
        "flex flex-wrap items-center justify-center gap-x-5 gap-y-3 rounded-2xl bg-brand-soft px-4 py-3 text-center shadow-[inset_0_0_0_1px_var(--brand-line)] md:px-6",
        sticky && "sticky top-2 z-30 shadow-[inset_0_0_0_1px_var(--brand-line),0_8px_24px_-12px_rgb(0_0_0/0.25)]",
        className,
      )}
    >
      <p aria-live="polite" className="min-w-0 text-[16px] leading-snug font-semibold text-balance md:text-[18px]">
        <span className="tabular mr-2.5 inline-block rounded-full bg-brand px-2.5 py-1 align-[0.15em] text-[12px] leading-none font-semibold text-brand-foreground">
          {step.number ? `Step ${step.number} of ${step.total}` : "Done"}
        </span>
        {step.text}
      </p>
      {/* On a wide screen the second row is always there, so the bar keeps its height from step to step. On a phone the ring hint gives way to the content. */}
      <div className={cx("flex min-h-12 flex-wrap items-center justify-center gap-2", !primary && !step.waiting && "max-md:hidden")}>
        {primary ? <ActionButton action={primary} primary /> : <Hint waiting={step.waiting} />}
        {secondary && <ActionButton action={secondary} primary={false} />}
      </div>
    </section>
  );
}
