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

/** A line of the inbox list that is not part of the conversation, for example mail read before closing. */
export type InboxListEntry = Pick<EmailThread, "id" | "from" | "subject" | "snippet" | "time">;

export type ChannelThreadProps = {
  thread: ThreadView;
  profile: CompanyProfile;
  /**
   * Whose app the thread opens in. The film shows the business's inbox; in live mode the visitor
   * is the customer, so Instagram and LinkedIn show the business in the header and the visitor's
   * messages as their own.
   */
  seenBy?: "business" | "customer";
  /** Website chat: the chat window alone, or open on the company's website. Phones always get the window. */
  chatLayout?: "window" | "page";
  /** Email only: older mail in the inbox list. */
  earlierEmails?: InboxListEntry[];
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

type EmailParties = { customer: { name: string; email: string }; business: { name: string; email: string } };

/** The open email thread, or none while nobody has written yet. */
function emailThreads(thread: ThreadView, parties: EmailParties, isNew: ChannelThreadProps["isNew"], metaOf: ChannelThreadProps["metaOf"]): EmailThread[] {
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
          isNew: isNew?.(message),
        };
      }),
    },
  ];
}

/** Seen by the customer, their own messages are the ones on the right. */
const asCustomer = (messages: ConversationMessage[]): ConversationMessage[] =>
  messages.map((message) => ({ ...message, from: message.from === "customer" ? "business" : "customer" }));

const otherSide = (typing: ThreadView["typing"]) => (typing === "business" ? "customer" : typing === "customer" ? "business" : undefined);

/** The channel's own app with the thread in it. Film and live share it. */
export function ChannelThread(props: ChannelThreadProps) {
  const { thread, profile, seenBy = "business", chatLayout = "page", earlierEmails = [], isNew, metaOf, controls = {}, className } = props;
  const slots = templateSlots(profile);
  // On a phone the website behind the chat leaves no room for the thread, so the chat shows alone.
  const narrow = useNarrowScreen();
  const businessAddress = profile.knowledge.contactEmail || `hello@${slots.website}`;
  const customerView = seenBy === "customer";
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
  const businessAvatar = profile.logo.kind === "url" ? profile.logo.url : undefined;
  const customer: Person = { name: thread.customer.name, detail: thread.customer.detail };

  switch (thread.channel) {
    case "email": {
      const parties = {
        customer: { name: thread.customer.name, email: thread.customer.detail },
        business: { name: profile.people.assistantName, email: businessAddress },
      };
      return (
        <EmailInbox
          account={customerView ? thread.customer.detail : businessAddress}
          className={className}
          openThreadId={thread.messages.length > 0 ? thread.id : null}
          drafting={thread.typing === "business" ? profile.people.assistantName : null}
          composeSubject="Question"
          threads={[...emailThreads(thread, parties, isNew, metaOf), ...earlierEmails]}
          {...live}
        />
      );
    }
    case "instagram": {
      const business: Person = { name: profile.name, detail: slots.handle, avatarUrl: businessAvatar };
      const shown = customerView ? asCustomer(messages) : messages;
      const lastIsOwn = shown.at(-1)?.from === "business";
      return (
        <InstagramDm
          className={className}
          account={customerView ? thread.customer.detail : (slots.handle ?? "")}
          customer={customerView ? business : customer}
          messages={shown}
          typing={customerView ? otherSide(thread.typing) : thread.typing}
          // The visitor's message reads "Seen" once the business is writing back.
          seen={customerView ? lastIsOwn && thread.typing === "business" : lastIsOwn}
          {...live}
        />
      );
    }
    case "linkedin": {
      const business: Person = { name: profile.people.assistantName, detail: profile.name, avatarUrl: businessAvatar };
      return (
        <LinkedinDm
          className={className}
          customer={customerView ? business : customer}
          business={customerView ? customer : business}
          messages={customerView ? asCustomer(messages) : messages}
          typing={customerView ? otherSide(thread.typing) : thread.typing}
          {...live}
        />
      );
    }
    case "chat":
      return (
        <ChatWidget
          className={className}
          layout={narrow ? "window" : chatLayout}
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
