import type { ComponentProps } from "react";
import { cx } from "./class-names";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "brand";
export type ButtonSize = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-foreground text-white hover:bg-[#2a2a2a] shadow-[0_1px_2px_rgb(0_0_0/0.12)]",
  secondary:
    "bg-surface text-foreground shadow-[0_0_0_1px_var(--border),0_1px_2px_rgb(0_0_0/0.05)] hover:bg-subtle",
  ghost: "text-foreground hover:bg-subtle",
  brand: "bg-brand text-brand-foreground hover:brightness-95 shadow-[0_1px_2px_rgb(0_0_0/0.12)]",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 max-sm:h-11 gap-1.5 rounded-lg px-3 text-[13px]",
  md: "h-10 max-sm:h-11 gap-2 rounded-[10px] px-4 text-sm",
  lg: "h-12 gap-2 rounded-xl px-5 text-base",
};

export type ButtonProps = ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  variant = "primary",
  size = "md",
  type = "button",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        "press inline-flex shrink-0 cursor-pointer items-center justify-center font-medium whitespace-nowrap select-none",
        "transition-[background-color,box-shadow,filter,transform] duration-150",
        "disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
