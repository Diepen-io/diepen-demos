"use client";

import { useNarrowScreen } from "@diepen/ui/film/use-stage-environment";
import { ChatWidget } from "@diepen/ui/mockups/chat-widget";
import type { ConversationControls, ConversationMessage, Person } from "@diepen/ui/mockups/conversation";
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

type EmailParties = { customer: { name: string; email: string }; business: { name: string; email: string } };

/** The open email thread, or none while nobody has written yet. */
function emailThreads(thread: ThreadView, parties: EmailParties, metaOf: ChannelThreadProps["metaOf"]): EmailThread[] {
  const [first] = thread.messages;
  if (!first) return [];
  return [
    {
      id: thread.id,
      from: parties.customer.name,
      subject: thread.subject ?? "Question",
      snippet: thread.messages.at(-1)?.text ?? "",
      time: clock(first),
      messages: thread.messages.map((message) => {
        const fromCustomer = message.role === "customer";
        return {
          from: fromCustomer ? parties.customer : parties.business,
          to: fromCustomer ? parties.business.email : parties.customer.email,
          time: clock(message),
          body: message.text,
          tag: fromCustomer ? undefined : <Badge tone="brand" icon="sparkle">AI assistant</Badge>,
          slots: slotsOf(message),
          meta: metaOf?.(message),
        };
      }),
    },
  ];
}

/** Seen by the customer, their own messages are the ones on the right. */
const asCustomer = (messages: ConversationMessage[]): ConversationMessage[] =>
  messages.map((message) => ({ ...message, from: message.from === "customer" ? "business" : "customer" }));

const otherSide = (typing: ThreadView["typing"]) => (typing === "business" ? "customer" : typing === "customer" ? "business" : undefined);

/**
 * The channel's own app with the thread in it, as the customer sees it: the visitor writes as the
 * customer, so Instagram and LinkedIn show the business in the header and the visitor's messages
 * as their own.
 */
export function ChannelThread(props: ChannelThreadProps) {
  const { thread, profile, metaOf, controls = {}, className } = props;
  const slots = templateSlots(profile);
  // On a phone the website behind the chat leaves no room for the thread, so the chat shows alone.
  const narrow = useNarrowScreen();
  const businessAddress = profile.knowledge.contactEmail || `hello@${slots.website}`;
  const handover = thread.handoverNote ? { note: thread.handoverNote, ...controls.handover } : controls.handover;
  const live = { ...controls, handover };
  const messages: ConversationMessage[] = thread.messages.map((message, index) => ({
    id: message.id,
    from: message.role === "customer" ? "customer" : "business",
    text: message.text,
    time: index === 0 ? `${wallParts(message.at).weekday.slice(0, 3)} ${clock(message)}` : undefined,
    meta: metaOf?.(message),
    slots: slotsOf(message),
  }));
  const businessAvatar = profile.logo.kind === "url" ? profile.logo.url : undefined;
  const customer: Person = { name: thread.customer.name, detail: thread.customer.detail };
  const own = asCustomer(messages);

  switch (thread.channel) {
    case "email": {
      const parties = {
        customer: { name: thread.customer.name, email: thread.customer.detail },
        business: { name: profile.people.assistantName, email: businessAddress },
      };
      return (
        <EmailInbox
          account={thread.customer.detail}
          className={className}
          openThreadId={thread.messages.length > 0 ? thread.id : null}
          drafting={thread.typing === "business" ? profile.people.assistantName : null}
          composeSubject="Question"
          threads={emailThreads(thread, parties, metaOf)}
          {...live}
        />
      );
    }
    case "instagram": {
      const business: Person = { name: profile.name, detail: slots.handle, avatarUrl: businessAvatar };
      const lastIsOwn = own.at(-1)?.from === "business";
      return (
        <InstagramDm
          className={className}
          account={thread.customer.detail}
          customer={business}
          messages={own}
          typing={otherSide(thread.typing)}
          // The visitor's message reads "Seen" once the business is writing back.
          seen={lastIsOwn && thread.typing === "business"}
          {...live}
        />
      );
    }
    case "linkedin": {
      const business: Person = { name: profile.people.assistantName, detail: profile.name, avatarUrl: businessAvatar };
      return (
        <LinkedinDm
          className={className}
          customer={business}
          business={customer}
          messages={own}
          typing={otherSide(thread.typing)}
          {...live}
        />
      );
    }
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
