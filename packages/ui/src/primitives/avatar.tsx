import { cx } from "./class-names";

/** Muted fills with white initials that pass 4.5:1, so any name gets a readable avatar. */
const fills = ["#0f766e", "#1d4ed8", "#7c3aed", "#be185d", "#b45309", "#15803d", "#4338ca", "#9f1239"];

export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = words[0]?.[0] ?? "?";
  const last = words.length > 1 ? (words[words.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

/** The same name always gets the same colour, in the film and in live mode. */
export function avatarColor(name: string): string {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return fills[hash % fills.length] ?? "#52525b";
}

export type AvatarProps = {
  name: string;
  size?: number;
  /** Optional photo. Initials show when it is missing. */
  src?: string;
  className?: string;
};

export function Avatar({ name, size = 36, src, className }: AvatarProps) {
  const style = { width: size, height: size, fontSize: Math.round(size * 0.38) };
  if (src) {
    return (
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        className={cx("image-outline shrink-0 rounded-full object-cover", className)}
        style={style}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className={cx("inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white", className)}
      style={{ ...style, backgroundColor: avatarColor(name) }}
    >
      {initials(name)}
    </span>
  );
}
