import { highlightProps } from "@diepen/ui/film/film-highlight";
import type { PanelRole } from "@diepen/ui/film/focus-script";
import { Avatar } from "@diepen/ui/primitives/avatar";
import { cx } from "@diepen/ui/primitives/class-names";
import { Icon } from "@diepen/ui/primitives/icon";
import type { CompanyProfile } from "@diepen/voice/profile";
import type { CSSProperties } from "react";
import { wallParts } from "@/domain/wall-clock";
import type { ThreadMessage } from "@/domain/inbox-snapshot";
import { fillTemplate } from "@/domain/message-template";
import type { FilmThread } from "@/film/film-state";
import { filmCustomers } from "@/film/fixtures";
import { filmText } from "./film-text";

export type FilmThreadProps = {
  thread: FilmThread;
  profile: CompanyProfile;
  role: PanelRole;
  highlight: string | undefined;
};

/** The last exchange of one conversation, big enough to read in a feed: the question and the answer. */
export function FilmThreadPanel({ thread, profile, role, highlight }: FilmThreadProps) {
  const ctx = { highlight };
  const shown = thread.messages.slice(-2);
  const customer = filmCustomers[thread.ref].name;
  const replyTimeId = `reply-time-${thread.ref}`;
  const firstReply = thread.messages.find((message) => message.role === "assistant");
  const size = role === "focus" ? "text-[17px] md:text-[20px]" : "text-[18px]";

  return (
    // Centred while the exchange fits; once it does not, the newest message stays in view and the
    // oldest fades out at the top. The padding keeps the highlight ring inside the clipped area.
    <div className={cx("-m-3 flex min-h-0 flex-1 flex-col justify-end overflow-hidden p-3 leading-[1.4]", size)} style={fadeTop}>
      <div className="my-auto flex flex-col gap-5">
        {shown.map((message) => (
          <div key={message.id} className="flex flex-col gap-5">
            {/* The reply time shows only in the beat about it. */}
            {message.id === firstReply?.id && highlight === replyTimeId && thread.firstReplySeconds !== undefined ? (
              <ReplyTime seconds={thread.firstReplySeconds} {...highlightProps(ctx, replyTimeId)} />
            ) : null}
            <Bubble
              message={message}
              name={message.role === "customer" ? customer : profile.people.assistantName}
              highlightId={`message-${message.id}`}
              ctx={ctx}
            >
              {filmText(fillTemplate(message.text, profile), profile)}
            </Bubble>
            {message.slots?.length ? <Slots message={message} ctx={ctx} /> : null}
          </div>
        ))}
        {thread.status === "needs_human" ? (
          <p
            className="flex items-center gap-2.5 self-center rounded-full bg-wait-soft px-4 py-2 font-medium text-wait shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--wait)_25%,white)]"
            {...highlightProps(ctx, `handover-${thread.ref}`)}
          >
            <Icon name="user" size={20} />
            {fillTemplate("Handed to {owner}", profile)}
          </p>
        ) : null}
      </div>
    </div>
  );
}

const fadeTop: CSSProperties = { maskImage: "linear-gradient(to bottom, transparent, #000 1.5rem)" };

type BubbleProps = {
  message: ThreadMessage;
  name: string;
  highlightId: string;
  ctx: { highlight?: string };
  children: string;
};

function Bubble({ message, name, highlightId, ctx, children }: BubbleProps) {
  const fromCustomer = message.role === "customer";
  return (
    <div className={cx("flex items-end gap-3", fromCustomer ? "pr-4 md:pr-10" : "flex-row-reverse pl-4 md:pl-10")}>
      {fromCustomer ? (
        <Avatar name={name} size={44} className="shrink-0 max-md:hidden" />
      ) : (
        <span aria-label={name} className="grid size-11 shrink-0 max-md:hidden place-items-center rounded-full bg-brand text-brand-foreground">
          <Icon name="sparkle" size={22} />
        </span>
      )}
      <p
        className={cx(
          "min-w-0 rounded-[22px] px-5 py-3.5 whitespace-pre-line [overflow-wrap:anywhere]",
          fromCustomer ? "rounded-bl-[8px] bg-subtle text-foreground" : "rounded-br-[8px] bg-brand text-brand-foreground",
        )}
        {...highlightProps(ctx, highlightId)}
      >
        {children}
      </p>
    </div>
  );
}

function Slots({ message, ctx }: { message: ThreadMessage; ctx: { highlight?: string } }) {
  return (
    <ul className="flex md:mr-[56px] flex-wrap justify-end gap-3 self-end rounded-[16px]" {...highlightProps(ctx, `slots-${message.id}`)}>
      {message.slots?.map((slot) => {
        const { weekday, time } = wallParts(slot.iso);
        return (
          <li
            key={slot.iso}
            className={cx(
              "flex h-12 items-center gap-2 rounded-[14px] px-4 font-semibold tabular-nums",
              slot.picked
                ? "bg-brand-soft text-foreground shadow-[inset_0_0_0_2px_var(--brand)]"
                : "bg-surface shadow-[inset_0_0_0_1.5px_var(--brand-line)]",
            )}
          >
            {slot.picked ? <Icon name="check" size={20} className="text-brand" /> : null}
            {weekday.slice(0, 3)} {time}
          </li>
        );
      })}
    </ul>
  );
}

function ReplyTime({ seconds, ...rest }: { seconds: number } & ReturnType<typeof highlightProps>) {
  return (
    <p className="flex items-baseline gap-3 self-center rounded-[18px] bg-surface px-5 py-2 shadow-[inset_0_0_0_1px_var(--border)]" {...rest}>
      <span className="text-muted">Answered in</span>
      <span className="text-[34px] leading-none font-semibold tracking-[-0.02em] tabular-nums">{seconds} s</span>
    </p>
  );
}
