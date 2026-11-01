"use client";

import { cx } from "@diepen/ui/primitives/class-names";
import { useLayoutEffect, useRef, type ReactNode } from "react";

/** A part of the screen the phone scrolls to, marked with `data-phone-focus` in the content. */
export type PhoneFocus = { target: string; block: "start" | "center" | "end" };

export type ClientPhoneProps = {
  /** Draws the phone on wide screens. A real phone shows the screen full width instead. */
  framed: boolean;
  /** The screen grows with its content and the page scrolls, instead of the screen scrolling inside it. */
  flow?: boolean;
  /** The story clock in the status bar, "12:40". */
  time: string;
  /** Changes when the screen changes, so the new screen starts at the top. */
  screenKey: string;
  /** Brings this part of the screen into view, as the film's caption talks about it. */
  focus?: PhoneFocus;
  /** The film shows the phone without letting anyone tap it. */
  inert?: boolean;
  children: ReactNode;
};

const focusAttribute = "data-phone-focus";

/** Props that mark an element as a place the phone can scroll to. */
export function phoneFocusTarget(target: string): Record<string, string> {
  return { [focusAttribute]: target };
}

/** Scrolls the screen to the focus: at once on a new screen, smoothly while the screen stays. */
function useFocusScroll(screenKey: string, focus: PhoneFocus | undefined) {
  const screen = useRef<HTMLDivElement>(null);
  const shownKey = useRef<string | null>(null);
  const target = focus?.target;
  const block = focus?.block ?? "start";

  useLayoutEffect(() => {
    const element = screen.current;
    if (!element) return;
    const sameScreen = shownKey.current === screenKey;
    shownKey.current = screenKey;
    const goal = target ? element.querySelector<HTMLElement>(`[${focusAttribute}="${target}"]`) : null;
    let top = 0;
    if (goal) {
      const offset = goal.getBoundingClientRect().top - element.getBoundingClientRect().top + element.scrollTop;
      const room = element.clientHeight - goal.offsetHeight;
      top = block === "start" ? offset - 8 : block === "center" ? offset - room / 2 : offset - room + 8;
    }
    element.scrollTo({ top: Math.max(0, top), behavior: sameScreen ? "smooth" : "instant" });
  }, [screenKey, target, block]);

  return screen;
}

function StatusBar({ time }: { time: string }) {
  return (
    <div aria-hidden="true" className="phone-status relative flex shrink-0 items-center justify-between font-semibold">
      <span className="tabular">{time}</span>
      <span className="phone-island absolute left-1/2 -translate-x-1/2 rounded-full bg-[#0b0b0c]" />
      <span className="flex items-end gap-[0.2em]">
        {[0.36, 0.52, 0.68, 0.84].map((height) => (
          <span key={height} className="w-[0.22em] rounded-[1px] bg-foreground" style={{ height: `${height}em` }} />
        ))}
        <span className="ml-[0.4em] flex h-[0.84em] w-[1.7em] items-center rounded-[0.22em] p-[0.12em] shadow-[inset_0_0_0_1px_var(--foreground)]">
          <span className="h-full w-3/4 rounded-[0.1em] bg-foreground" />
        </span>
      </span>
    </div>
  );
}

/**
 * Daniel's phone: the client side of the story. Everything he does happens on this one screen.
 * The frame keeps a 9:19 shape at a size set by the lane alone, so it never changes between screens.
 */
export function ClientPhone({ framed, flow, time, screenKey, focus, inert, children }: ClientPhoneProps) {
  const screenRef = useFocusScroll(screenKey, focus);
  const screen = (
    <div
      key={screenKey}
      ref={screenRef}
      className={cx("screen-in", !flow && "scroll-area min-h-0 flex-1 overflow-y-auto overscroll-contain")}
    >
      <div className="phone-content">{children}</div>
    </div>
  );
  if (!framed) {
    return (
      <div
        className={cx("flex flex-col overflow-hidden rounded-xl bg-surface shadow-[inset_0_0_0_1px_var(--border)]", !flow && "h-full min-h-0")}
        inert={inert}
      >
        {screen}
      </div>
    );
  }
  return (
    <div className="phone-slot grid h-full place-items-center">
      <div className="phone-frame flex flex-col bg-[#16161a] shadow-[0_0_0_1px_rgb(0_0_0/0.4),0_24px_48px_-24px_rgb(0_0_0/0.45),0_2px_6px_rgb(0_0_0/0.12)]" inert={inert}>
        <div className="phone-screen flex min-h-0 flex-1 flex-col overflow-hidden bg-surface">
          <StatusBar time={time} />
          {screen}
          <div aria-hidden="true" className="phone-home flex shrink-0 items-center justify-center">
            <span className="h-[5px] w-[34%] rounded-full bg-foreground/80" />
          </div>
        </div>
      </div>
    </div>
  );
}
