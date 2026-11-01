import type { ReactNode } from "react";
import { cx } from "../primitives/class-names";
import { Icon, type IconName } from "../primitives/icon";
import type { KeynoteChipTone } from "./keynote-script";

/**
 * The large, chrome-free elements a keynote beat shows: one message, one notification, one row,
 * one slot, one card or three figures. Text starts at 18 px so it reads in a phone feed.
 */
const surface = "rounded-[28px] bg-white/95 shadow-[0_1px_2px_rgb(0_0_0/0.04),0_24px_60px_-20px_rgb(0_0_0/0.22)] ring-1 ring-black/5";

const chipTones: Record<KeynoteChipTone, string> = {
  neutral: "bg-white/90 text-foreground ring-black/10",
  pass: "bg-[color-mix(in_oklch,var(--pass)_12%,white)] text-pass ring-[color-mix(in_oklch,var(--pass)_30%,white)]",
  wait: "bg-[color-mix(in_oklch,var(--wait)_12%,white)] text-wait ring-[color-mix(in_oklch,var(--wait)_30%,white)]",
  fail: "bg-[color-mix(in_oklch,var(--fail)_10%,white)] text-fail ring-[color-mix(in_oklch,var(--fail)_28%,white)]",
  brand: "bg-brand text-brand-foreground ring-transparent",
};

export function KeynoteChip({ tone = "neutral", children }: { tone?: KeynoteChipTone; children: ReactNode }) {
  return (
    <span className={cx("inline-flex h-10 items-center rounded-full px-5 text-[18px] font-semibold ring-1", chipTones[tone])}>
      {children}
    </span>
  );
}

function Avatar({ name, brand }: { name: string; brand?: boolean }) {
  const initials = name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return (
    <span
      aria-hidden
      className={cx(
        "grid size-12 shrink-0 place-items-center rounded-full text-[17px] font-semibold",
        brand ? "bg-brand text-brand-foreground" : "bg-foreground/85 text-white",
      )}
    >
      {initials}
    </span>
  );
}

/** One message. `from: "business"` sits on the right in the brand colour. */
export function KeynoteBubble({ name, text, from, channel }: { name: string; text: string; from: "customer" | "business"; channel?: string }) {
  const business = from === "business";
  return (
    <div className={cx("flex w-full max-w-[36rem] items-end gap-3 text-left", business && "flex-row-reverse")}>
      <Avatar name={name} brand={business} />
      <div className="min-w-0">
        <p className={cx("mb-1.5 text-[16px] font-medium text-muted", business && "text-right")}>
          {name}
          {channel ? ` · ${channel}` : ""}
        </p>
        <p
          className={cx(
            "rounded-[26px] px-6 py-4 text-[clamp(18px,1.6vw,24px)] leading-snug",
            business ? "rounded-br-lg bg-brand text-brand-foreground" : "rounded-bl-lg bg-white shadow-sm ring-1 ring-black/5",
          )}
        >
          {text}
        </p>
      </div>
    </div>
  );
}

/** A phone-style notification: app, title, one line. */
export function KeynoteNotification({ icon, app, title, body }: { icon: IconName; app: string; title: string; body?: string }) {
  return (
    <div className={cx(surface, "flex w-full max-w-[34rem] items-start gap-4 p-5 text-left")}>
      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand text-brand-foreground">
        <Icon name={icon} size={22} />
      </span>
      <div className="min-w-0">
        <p className="text-[16px] font-medium text-muted">{app}</p>
        <p className="text-[clamp(19px,1.7vw,26px)] font-semibold leading-tight">{title}</p>
        {body ? <p className="mt-1 text-[18px] text-muted">{body}</p> : null}
      </div>
    </div>
  );
}

/** One file or checklist row with a status mark. */
export function KeynoteRow({ icon = "file", title, status }: { icon?: IconName; title: string; status?: "pass" | "fail" | "wait" }) {
  const mark = status === "pass" ? "check" : status === "fail" ? "alert" : status === "wait" ? "clock" : null;
  return (
    <div className={cx(surface, "flex w-full max-w-[32rem] items-center gap-4 px-6 py-5 text-left")}>
      <Icon name={icon} size={26} className="shrink-0 text-muted" />
      <p className="min-w-0 flex-1 truncate text-[clamp(19px,1.7vw,26px)] font-semibold">{title}</p>
      {mark ? (
        <span
          className={cx(
            "grid size-10 shrink-0 place-items-center rounded-full text-white",
            status === "pass" ? "bg-pass" : status === "fail" ? "bg-fail" : "bg-wait",
          )}
        >
          <Icon name={mark} size={20} />
        </span>
      ) : null}
    </div>
  );
}

/** A small stack of file chips, for "the client uploads 6 files". */
export function KeynoteFileStack({ names }: { names: string[] }) {
  return (
    <ul className="flex max-w-[40rem] flex-wrap justify-center gap-3">
      {names.map((name) => (
        <li key={name} className="inline-flex items-center gap-2 rounded-2xl bg-white/95 px-4 py-3 text-[18px] font-medium shadow-sm ring-1 ring-black/5">
          <Icon name="file" size={20} className="text-brand" />
          {name}
        </li>
      ))}
    </ul>
  );
}

/** One calendar slot: the day, the time and what was booked. */
export function KeynoteSlot({ day, time, title }: { day: string; time: string; title: string }) {
  return (
    <div className={cx(surface, "flex w-full max-w-[30rem] items-stretch overflow-hidden text-left")}>
      <div className="flex w-28 shrink-0 flex-col items-center justify-center gap-1 bg-brand py-5 text-brand-foreground">
        <Icon name="calendar" size={22} />
        <span className="text-[17px] font-semibold">{day}</span>
      </div>
      <div className="flex flex-col justify-center px-6 py-5">
        <p className="text-[clamp(30px,2.8vw,44px)] font-semibold leading-none tabular-nums">{time}</p>
        <p className="mt-2 text-[18px] text-muted">{title}</p>
      </div>
    </div>
  );
}

/** A card with a title, a few lines and one large value, for a call or a proposal. */
export function KeynoteCard({ icon, eyebrow, title, value, lines = [] }: { icon: IconName; eyebrow: string; title: string; value?: string; lines?: string[] }) {
  return (
    <div className={cx(surface, "w-full max-w-[34rem] p-7 text-left")}>
      <p className="flex items-center gap-2 text-[16px] font-medium text-muted">
        <Icon name={icon} size={18} className="text-brand" />
        {eyebrow}
      </p>
      <p className="mt-3 text-[clamp(22px,2vw,30px)] font-semibold leading-tight">{title}</p>
      {lines.length ? (
        <ul className="mt-3 space-y-1.5 text-[18px] text-muted">
          {lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : null}
      {value ? <p className="mt-5 text-[clamp(30px,2.8vw,44px)] font-semibold leading-none tracking-[-0.02em] text-brand">{value}</p> : null}
    </div>
  );
}

/** Up to three big figures side by side. */
export function KeynoteFigures({ figures }: { figures: { value: string; label: string }[] }) {
  return (
    <dl className="grid w-full max-w-[44rem] grid-cols-3 gap-3 md:gap-5">
      {figures.slice(0, 3).map((figure) => (
        <div key={figure.label} className={cx(surface, "flex flex-col-reverse items-center px-3 py-6 md:px-5")}>
          <dt className="mt-2 text-[16px] font-medium leading-tight text-muted md:text-[18px]">{figure.label}</dt>
          <dd className="text-[clamp(36px,4vw,64px)] font-semibold leading-none tracking-[-0.03em] tabular-nums">{figure.value}</dd>
        </div>
      ))}
    </dl>
  );
}
