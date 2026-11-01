import { cx } from "@diepen/ui/primitives/class-names";
import type { ReactNode } from "react";

export type ClientPhoneProps = {
  /** Draws the phone on wide screens. A real phone shows the screen full width instead. */
  framed: boolean;
  /** The story clock in the status bar, "12:40". */
  time: string;
  /** Changes when the screen changes, so the new screen starts at the top. */
  screenKey: string;
  /** The film shows the phone without letting anyone tap it. */
  inert?: boolean;
  children: ReactNode;
};

function StatusBar({ time }: { time: string }) {
  return (
    <div aria-hidden="true" className="relative flex h-9 shrink-0 items-center justify-between px-6 text-[13px] font-semibold">
      <span className="tabular">{time}</span>
      <span className="absolute top-2 left-1/2 h-[22px] w-[34%] -translate-x-1/2 rounded-full bg-[#0b0b0c]" />
      <span className="flex items-end gap-[3px]">
        {[5, 7, 9, 11].map((height) => (
          <span key={height} className="w-[3px] rounded-[1px] bg-foreground" style={{ height }} />
        ))}
        <span className="ml-1.5 flex h-[11px] w-[22px] items-center rounded-[3px] p-[1.5px] shadow-[inset_0_0_0_1px_var(--foreground)]">
          <span className="h-full w-3/4 rounded-[1.5px] bg-foreground" />
        </span>
      </span>
    </div>
  );
}

/** Daniel's phone: the client side of the story. Everything he does happens on this one screen. */
export function ClientPhone({ framed, time, screenKey, inert, children }: ClientPhoneProps) {
  const screen = (
    <div key={screenKey} className="screen-in scroll-area min-h-0 flex-1 overflow-y-auto overscroll-contain">
      {children}
    </div>
  );
  if (!framed) return <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl bg-surface shadow-[inset_0_0_0_1px_var(--border)]" inert={inert}>{screen}</div>;
  return (
    <div className="flex h-full min-h-0 items-center justify-center">
      <div
        className={cx(
          "flex aspect-[9/19] h-full max-h-[820px] max-w-full flex-col rounded-[38px] bg-[#16161a] p-[7px]",
          "shadow-[0_0_0_1px_rgb(0_0_0/0.4),0_24px_48px_-24px_rgb(0_0_0/0.45),0_2px_6px_rgb(0_0_0/0.12)]",
        )}
        inert={inert}
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[31px] bg-surface">
          <StatusBar time={time} />
          {screen}
          <div aria-hidden="true" className="flex h-5 shrink-0 items-center justify-center">
            <span className="h-[5px] w-[34%] rounded-full bg-foreground/80" />
          </div>
        </div>
      </div>
    </div>
  );
}
