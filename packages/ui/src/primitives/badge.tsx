import type { ReactNode } from "react";
import { cx } from "./class-names";
import { Icon, type IconName } from "./icon";

export type BadgeTone = "neutral" | "brand" | "info" | "pass" | "wait" | "fail";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-subtle text-muted shadow-[inset_0_0_0_1px_var(--border)]",
  brand: "bg-brand-soft text-foreground shadow-[inset_0_0_0_1px_var(--brand-line)]",
  info: "bg-info-soft text-info shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--info)_22%,white)]",
  pass: "bg-pass-soft text-pass shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--pass)_22%,white)]",
  wait: "bg-wait-soft text-wait shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--wait)_25%,white)]",
  fail: "bg-fail-soft text-fail shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--fail)_22%,white)]",
};

/** `lg` is for film panels, where nothing reads below 16 px at the 1280x720 recording size. */
export type BadgeSize = "md" | "lg";

const sizes: Record<BadgeSize, { className: string; icon: number }> = {
  md: { className: "h-6 gap-1 px-2.5 text-[13px]", icon: 13 },
  lg: { className: "h-9 gap-1.5 px-3.5 text-[17px]", icon: 17 },
};

export type BadgeProps = {
  tone?: BadgeTone;
  size?: BadgeSize;
  icon?: IconName;
  children: ReactNode;
  className?: string;
};

export function Badge({ tone = "neutral", size = "md", icon, children, className }: BadgeProps) {
  const look = sizes[size];
  return (
    <span
      className={cx(
        "inline-flex shrink-0 items-center rounded-full font-medium whitespace-nowrap",
        look.className,
        tones[tone],
        className,
      )}
    >
      {icon && <Icon name={icon} size={look.icon} strokeWidth={2.25} />}
      {children}
    </span>
  );
}

/** Matches the status an inbox reply carries, so a reply maps to a chip without translation. */
export type ConversationStatus = "answered" | "booking_offered" | "booked" | "needs_human";
export type DocumentStatus = "received" | "checked" | "problem" | "missing";
export type Status = ConversationStatus | DocumentStatus;

type StatusLook = { label: string; tone: BadgeTone; icon: IconName };

/** One look per status, so the owner reads the same colour and word in every demo. Semantic, never brand. */
export const statusLooks: Record<Status, StatusLook> = {
  answered: { label: "Answered", tone: "neutral", icon: "check" },
  booking_offered: { label: "Slot offered", tone: "info", icon: "clock" },
  booked: { label: "Booked", tone: "pass", icon: "calendar" },
  needs_human: { label: "Needs a human", tone: "wait", icon: "user" },
  received: { label: "Received", tone: "neutral", icon: "file" },
  checked: { label: "Checked", tone: "pass", icon: "check" },
  problem: { label: "Problem found", tone: "fail", icon: "alert" },
  missing: { label: "Missing", tone: "wait", icon: "clock" },
};

export function StatusBadge({ status, size, className }: { status: Status; size?: BadgeSize; className?: string }) {
  const look = statusLooks[status];
  return (
    <Badge tone={look.tone} size={size} icon={look.icon} className={className}>
      {look.label}
    </Badge>
  );
}
