import { Avatar } from "@diepen/ui/primitives/avatar";
import { cx } from "@diepen/ui/primitives/class-names";
import type { FilmCallLine } from "@/film/meetings-film-data";
import { HighlightedText } from "./highlighted-text";

export type CallLaneProps = {
  seller: { name: string; company: string };
  prospect: { name: string; role: string };
  lines: (FilmCallLine & { isNew: boolean })[];
  state: "live" | "ended";
  /** Call time shown next to the live marker, or the length once it ended. */
  elapsed: string;
};

/** The call as a live transcript: who talks, when, and what they said. */
export function CallLane({ seller, prospect, lines, state, elapsed }: CallLaneProps) {
  return (
    <div data-lane="call" className="flex flex-col gap-4">
      <header className="flex items-center gap-3 rounded-xl bg-subtle px-3.5 py-3">
        <span className="flex -space-x-2">
          <Avatar name={seller.name} size={34} className="ring-2 ring-subtle" />
          <Avatar name={prospect.name} size={34} className="ring-2 ring-subtle" />
        </span>
        <span className="min-w-0 flex-1 text-[14px] leading-snug text-pretty 2xl:text-[16px]">
          <span className="block font-semibold">
            {seller.name} with {prospect.name}, {prospect.role}
          </span>
          <span className="block text-muted">{seller.company}</span>
        </span>
      </header>
      <ol className="flex flex-col gap-4 2xl:gap-5">
        {lines.map((line, index) => (
          <li key={line.time} className={cx("flex gap-3", line.isNew && "enter")}>
            <Avatar name={line.speaker} size={32} />
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-[14px] font-semibold 2xl:text-[16px]">{line.speaker}</span>
                <span className="tabular text-[13px] text-faint">{line.time}</span>
                {/* The live marker rides on the newest line, so a landing line never pushes it out of the lane. */}
                {state === "live" && index === lines.length - 1 ? <LiveMarker elapsed={elapsed} /> : null}
              </p>
              <p className="text-[16px] leading-[1.45] text-foreground 2xl:text-[20px]">
                <HighlightedText text={line.text} highlights={line.highlights} />
              </p>
            </div>
          </li>
        ))}
      </ol>
      {state === "live" && lines.length === 0 ? <LiveMarker elapsed={elapsed} /> : null}
      {state === "ended" ? (
        <p className="enter flex items-center gap-3 text-[14px] font-medium text-muted 2xl:text-[16px]">
          <span className="h-px flex-1 bg-border" />
          <span className="tabular">Call ended {elapsed}</span>
          <span className="h-px flex-1 bg-border" />
        </p>
      ) : null}
    </div>
  );
}

function LiveMarker({ elapsed }: { elapsed: string }) {
  return (
    <span className="ml-auto flex shrink-0 items-center gap-1.5 self-center text-[13px] font-medium text-channel-call 2xl:text-[14px]">
      <span aria-hidden="true" className="size-2 animate-pulse rounded-full bg-channel-call" />
      Live <span className="tabular text-muted">{elapsed}</span>
    </span>
  );
}
