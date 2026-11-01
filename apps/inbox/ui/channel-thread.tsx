"use client";

import { useNarrowScreen } from "@diepen/ui/film/use-stage-environment";
import { ChatWidget } from "@diepen/ui/mockups/chat-widget";
import type { ConversationControls, ConversationMessage } from "@diepen/ui/mockups/conversation";
import { EmailInbox, type EmailThread } from "@diepen/ui/mockups/email-inbox";
import { InstagramDm } from "@diepen/ui/mockups/instagram-dm";
import { LinkedinDm } from "@diepen/ui/mockups/linkedin-dm";
import { Badge } from "@diepen/ui/primitives/badge";
import type { CompanyProfile } from "@diepen/voice/profile";
import { formatSlotChip } from "@/domain/calendar";
import type { ThreadMessage, ThreadView } from "@/domain/inbox-snapshot";
import { templateSlots } from "@/domain/message-template";
import { wallParts } from "@/domain/wall-clock";

export type ChannelThreadProps = {
  thread: ThreadView;
  profile: CompanyProfile;
  isNew?: (message: ThreadMessage) => boolean;
  /** A quiet line under a message, for example "Replied in 1.8 s". */
  metaOf?: (message: ThreadMessage) => string | undefined;
  /** Live mode: the composer, starters, slot chips and the handover note. */
  controls?: ConversationControls;
  className?: string;
};

const clock = (message: ThreadMessage) => message.at.slice(11, 16);

function slotsOf(message: ThreadMessage) {
  return message.slots?.map((slot) => ({ iso: slot.iso, label: formatSlotChip(slot.iso), picked: slot.picked }));
}

/** The open email thread, or none while the visitor has not written yet. */
function emailThreads(
  thread: ThreadView,
  assistantName: string,
  account: string,
  isNew: ChannelThreadProps["isNew"],
  metaOf: ChannelThreadProps["metaOf"],
): EmailThread[] {
  const [first] = thread.messages;
  if (!first) return [];
  return [
    {
      id: thread.id,
      from: thread.customer.name,
      subject: thread.subject ?? "Question",
      snippet: thread.messages.at(-1)?.text ?? "",
      time: clock(first),
      messages: thread.messages.map((message) => {
        const fromCustomer = message.role === "customer";
        return {
          from: fromCustomer ? { name: thread.customer.name, email: thread.customer.detail } : { name: assistantName, email: account },
          to: fromCustomer ? account : thread.customer.detail,
          time: clock(message),
          body: message.text,
          tag: fromCustomer ? undefined : <Badge tone="brand" icon="sparkle">AI assistant</Badge>,
          slots: slotsOf(message),
          meta: metaOf?.(message),
          isNew: isNew?.(message),
        };
      }),
    },
  ];
}

/** The channel's own app with the thread in it, the way the business sees it. Film and live share it. */
export function ChannelThread({ thread, profile, isNew, metaOf, controls = {}, className }: ChannelThreadProps) {
  const slots = templateSlots(profile);
  // On a phone the website behind the chat leaves no room for the thread, so the chat shows alone.
  const narrow = useNarrowScreen();
  const account = profile.knowledge.contactEmail || `hello@${slots.website}`;
  const handover = thread.handoverNote ? { note: thread.handoverNote, ...controls.handover } : controls.handover;
  const live = { ...controls, handover };
  const messages: ConversationMessage[] = thread.messages.map((message, index) => ({
    id: message.id,
    from: message.role === "customer" ? "customer" : "business",
    text: message.text,
    time: index === 0 ? `${wallParts(message.at).weekday.slice(0, 3)} ${clock(message)}` : undefined,
    meta: metaOf?.(message),
    slots: slotsOf(message),
    isNew: isNew?.(message),
  }));

  switch (thread.channel) {
    case "email":
      return (
        <EmailInbox
          account={account}
          className={className}
          openThreadId={thread.messages.length > 0 ? thread.id : null}
          drafting={thread.typing === "business" ? profile.people.assistantName : null}
          composeSubject="Question"
          threads={emailThreads(thread, profile.people.assistantName, account, isNew, metaOf)}
          {...live}
        />
      );
    case "instagram":
      return (
        <InstagramDm
          className={className}
          account={slots.handle ?? ""}
          customer={{ name: thread.customer.name, detail: thread.customer.detail }}
          messages={messages}
          typing={thread.typing}
          seen={messages.at(-1)?.from === "business"}
          {...live}
        />
      );
    case "linkedin":
      return (
        <LinkedinDm
          className={className}
          customer={{ name: thread.customer.name, detail: thread.customer.detail }}
          business={{ name: profile.people.assistantName, detail: profile.name }}
          messages={messages}
          typing={thread.typing}
          {...live}
        />
      );
    case "chat":
      return (
        <ChatWidget
          className={className}
          layout={narrow ? "window" : "page"}
          company={profile}
          assistantName={profile.people.assistantName}
          website={slots.website}
          site={{ tagline: profile.tagline, highlights: profile.knowledge.services.slice(0, 3).map((service) => service.name) }}
          messages={messages}
          typing={thread.typing}
          {...live}
        />
      );
  }
}
