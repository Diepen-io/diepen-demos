import type { ReactNode } from "react";
import { cx } from "../primitives/class-names";
import { Icon, type IconName } from "../primitives/icon";
import type { KeynoteChipTone } from "./keynote-script";

/**
 * The large, chrome-free elements a keynote beat shows: one message, one notification, one row,
 * one slot, one card or three figures. Text starts at 18 px so it reads in a phone feed.
 */
const surface = "rounded-[32px] bg-white/95 shadow-[0_1px_2px_rgb(0_0_0/0.04),0_28px_70px_-24px_rgb(0_0_0/0.24)] ring-1 ring-black/5";

// One scale for every part, sized for a 1920x1080 video watched in a phone feed.
// At the 1280x720 recording layout: cards are 45% of the frame, body text 26 px, small text 20 px.
const cardWidth = "w-full max-w-[30rem] md:max-w-[min(45vw,50rem)]";
const metaText = "text-[clamp(18px,1.6vw,26px)]";
const bodyText = "text-[clamp(20px,2vw,34px)]";
const titleText = "text-[clamp(24px,2.4vw,40px)]";
const valueText = "text-[clamp(40px,4.2vw,72px)]";

const chipTones: Record<KeynoteChipTone, string> = {
  neutral: "bg-white/90 text-foreground ring-black/10",
  pass: "bg-[color-mix(in_oklch,var(--pass)_12%,white)] text-pass ring-[color-mix(in_oklch,var(--pass)_30%,white)]",
  wait: "bg-[color-mix(in_oklch,var(--wait)_12%,white)] text-wait ring-[color-mix(in_oklch,var(--wait)_30%,white)]",
  fail: "bg-[color-mix(in_oklch,var(--fail)_10%,white)] text-fail ring-[color-mix(in_oklch,var(--fail)_28%,white)]",
  brand: "bg-brand text-brand-foreground ring-transparent",
};

export function KeynoteChip({ tone = "neutral", children }: { tone?: KeynoteChipTone; children: ReactNode }) {
  return (
    <span className={cx("inline-flex h-12 items-center rounded-full px-6 text-[clamp(18px,1.6vw,26px)] font-semibold ring-1", chipTones[tone])}>
      {children}
    </span>
  );
}

function Avatar({ name, initials: given, brand }: { name: string; initials?: string; brand?: boolean }) {
  const initials = given ?? name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return (
    <span
      aria-hidden
      className={cx(
        "grid size-12 shrink-0 place-items-center rounded-full text-[17px] font-semibold md:size-16 md:text-[22px]",
        brand ? "bg-brand text-brand-foreground" : "bg-foreground/85 text-white",
      )}
    >
      {initials}
    </span>
  );
}

/** One message. `from: "business"` sits on the right in the brand colour; `initials` overrides the avatar letters. */
export function KeynoteBubble({ name, text, from, channel, initials }: { name: string; text: string; from: "customer" | "business"; channel?: string; initials?: string }) {
  const business = from === "business";
  return (
    <div className={cx("flex w-full max-w-[32rem] items-end gap-4 text-left md:max-w-[min(50vw,54rem)]", business && "flex-row-reverse")}>
      <Avatar name={name} initials={initials} brand={business} />
      <div className="min-w-0">
        <p className={cx("mb-2 font-medium text-muted", metaText, business && "text-right")}>
          {name}
          {channel ? ` · ${channel}` : ""}
        </p>
        <p
          className={cx(
            "rounded-[30px] px-7 py-5 leading-snug",
            bodyText,
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
    <div className={cx(surface, cardWidth, "flex items-start gap-5 p-6 text-left md:p-7")}>
      <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-brand text-brand-foreground md:size-16">
        <Icon name={icon} size={28} />
      </span>
      <div className="min-w-0">
        <p className={cx("font-medium text-muted", metaText)}>{app}</p>
        <p className={cx("mt-0.5 font-semibold leading-tight", titleText)}>{title}</p>
        {body ? <p className={cx("mt-1.5 text-muted", metaText)}>{body}</p> : null}
      </div>
    </div>
  );
}

/** One file or checklist row with a status mark. */
export function KeynoteRow({ icon = "file", title, status }: { icon?: IconName; title: string; status?: "pass" | "fail" | "wait" }) {
  const mark = status === "pass" ? "check" : status === "fail" ? "alert" : status === "wait" ? "clock" : null;
  return (
    <div className={cx(surface, cardWidth, "flex items-center gap-5 px-7 py-6 text-left md:py-7")}>
      <Icon name={icon} size={34} className="shrink-0 text-muted" />
      <p className={cx("min-w-0 flex-1 truncate font-semibold", titleText)}>{title}</p>
      {mark ? (
        <span
          className={cx(
            "grid size-12 shrink-0 place-items-center rounded-full text-white md:size-14",
            status === "pass" ? "bg-pass" : status === "fail" ? "bg-fail" : "bg-wait",
          )}
        >
          <Icon name={mark} size={26} />
        </span>
      ) : null}
    </div>
  );
}

/** A small stack of file chips, for "the client uploads 6 files". */
export function KeynoteFileStack({ names }: { names: string[] }) {
  return (
    <ul className="flex max-w-[34rem] flex-wrap justify-center gap-3 md:max-w-[min(62vw,64rem)] md:gap-4">
      {names.map((name) => (
        <li key={name} className={cx("inline-flex items-center gap-2.5 rounded-2xl bg-white/95 px-5 py-3.5 font-medium shadow-sm ring-1 ring-black/5", bodyText)}>
          <Icon name="file" size={26} className="text-brand" />
          {name}
        </li>
      ))}
    </ul>
  );
}

/** One calendar slot: the day, the time and what was booked. */
export function KeynoteSlot({ day, time, title }: { day: string; time: string; title: string }) {
  return (
    <div className={cx(surface, cardWidth, "flex items-stretch overflow-hidden text-left")}>
      <div className="flex w-28 shrink-0 flex-col items-center justify-center gap-1.5 bg-brand py-6 text-brand-foreground md:w-36">
        <Icon name="calendar" size={28} />
        <span className={cx("font-semibold", metaText)}>{day}</span>
      </div>
      <div className="flex min-w-0 flex-col justify-center px-7 py-6">
        <p className={cx("font-semibold leading-none", valueText)}>{time}</p>
        <p className={cx("mt-2.5 text-muted", metaText)}>{title}</p>
      </div>
    </div>
  );
}

/** A card with a title, a few lines and one large value, for a call or a proposal. */
export function KeynoteCard({ icon, eyebrow, title, value, lines = [] }: { icon: IconName; eyebrow: string; title: string; value?: string; lines?: string[] }) {
  return (
    <div className={cx(surface, cardWidth, "p-7 text-left md:p-9")}>
      <p className={cx("flex items-center gap-2.5 font-medium text-muted", metaText)}>
        <Icon name={icon} size={24} className="text-brand" />
        {eyebrow}
      </p>
      <p className={cx("mt-3 font-semibold leading-tight", titleText)}>{title}</p>
      {lines.length ? (
        <ul className={cx("mt-3 space-y-1.5 text-muted", metaText)}>
          {lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : null}
      {value ? <p className={cx("mt-6 font-semibold leading-none tracking-[-0.02em] text-brand", valueText)}>{value}</p> : null}
    </div>
  );
}

/** Up to three big figures side by side. */
export function KeynoteFigures({ figures }: { figures: { value: string; label: string }[] }) {
  return (
    <dl className="grid w-full max-w-[34rem] grid-cols-3 gap-3 md:max-w-[min(62vw,64rem)] md:gap-6">
      {figures.slice(0, 3).map((figure) => (
        <div key={figure.label} className={cx(surface, "flex flex-col-reverse items-center px-3 py-7 md:px-6 md:py-9")}>
          <dt className={cx("mt-3 font-medium leading-tight text-muted", metaText)}>{figure.label}</dt>
          <dd className="text-[clamp(40px,5.4vw,92px)] font-semibold leading-none tracking-[-0.03em]">{figure.value}</dd>
        </div>
      ))}
    </dl>
  );
}
