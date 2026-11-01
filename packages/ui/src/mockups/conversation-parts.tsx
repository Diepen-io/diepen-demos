"use client";

import type { ReactNode } from "react";
import type { ChannelId } from "./channel-looks";
import { Composer } from "./composer";
import type { ConversationControls, ConversationMessage } from "./conversation";
import { HandoverNote } from "./handover-note";
import { SlotChips } from "./slot-chips";
import { StarterChips } from "./starter-chips";

/** Once a person has taken over, the times offered earlier are no longer on offer. */
export function slotsOnOffer(controls: ConversationControls): { onPick?: (iso: string) => void; disabled: boolean } {
  return controls.handover ? { disabled: true } : { onPick: controls.onPickSlot, disabled: false };
}

/** The meta line and slot chips under one message, the same on every channel. */
export function MessageExtras({ message, controls, align }: { message: ConversationMessage; controls: ConversationControls; align: "start" | "end" }) {
  if (!message.meta && !message.slots?.length) return null;
  return (
    <div className={align === "end" ? "mt-1.5 flex flex-col items-end gap-1.5" : "mt-1.5 flex flex-col items-start gap-1.5"}>
      {message.slots && message.slots.length > 0 && (
        <SlotChips slots={message.slots} {...slotsOnOffer(controls)} className={align === "end" ? "justify-end" : undefined} />
      )}
      {message.meta && <p className="tabular text-meta text-faint">{message.meta}</p>}
    </div>
  );
}

/** Starters while the thread is empty, and a notice at its end. */
export function ThreadEnd({ isEmpty, controls }: { isEmpty: boolean; controls: ConversationControls }) {
  return (
    <>
      {isEmpty && controls.starters && controls.starters.length > 0 && (
        <StarterChips starters={controls.starters} onPick={controls.onSend ? (text) => void controls.onSend?.(text) : undefined} />
      )}
      {controls.notice && (
        <p role="alert" className="enter mt-2 self-center rounded-full bg-fail-soft px-3 py-1.5 text-meta text-fail">
          {controls.notice}
        </p>
      )}
    </>
  );
}

/** The bottom of a conversation: the handover note, a working composer, or the channel's static bar. */
export function ConversationFooter({
  channel,
  controls,
  staticBar,
  subject,
}: {
  channel: ChannelId;
  controls: ConversationControls;
  staticBar: ReactNode;
  subject?: string;
}) {
  if (controls.handover) return <HandoverNote note={controls.handover.note} onStartOver={controls.handover.onStartOver} />;
  if (controls.onSend) return <Composer channel={channel} onSend={controls.onSend} disabled={controls.sending} subject={subject} />;
  return staticBar;
}
