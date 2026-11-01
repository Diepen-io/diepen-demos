"use client";

import { followUpEmail, reminderEmail } from "@/domain/chase-emails";
import { isUploadItemId, requestItem } from "@/domain/document-request";
import { ClientPhone } from "@/ui/client-phone";
import { EmailView, PhoneInbox } from "@/ui/email-views";
import { EngagementLetter } from "@/ui/engagement-letter";
import { inboxEmail, requestMessage } from "@/ui/inbox-emails";
import { UploadPage } from "@/ui/upload-page";
import type { UploadRow } from "@/ui/upload-item";
import { Button } from "@diepen/ui/primitives/button";
import type { CompanyProfile } from "@diepen/voice/profile";
import { memo } from "react";
import type { FilmState } from "./film-state";
import { filmOutstanding, reasonFor, resultsByItem } from "./film-views";

export const signingMs = 1200;
const uploadingMs = 1400;
const freshMs = 700;

/**
 * What changes inside one beat: the clock minute, the signature stroke and the upload bars. The
 * phone re-renders only when one of these changes, not on every film frame.
 */
export type ClientMoment = { clock: string; signing: number; uploading: string; freshEmails: string };

export function clientMomentAt(state: FilmState, t: number, clock: string): ClientMoment {
  const { signedAt, dropped, emails } = state.client;
  return {
    clock,
    signing: signedAt === undefined ? 0 : Math.min(1, Math.round(((t - signedAt) / signingMs) * 60) / 60),
    uploading: Object.entries(dropped).flatMap(([itemId, file]) => (t - file.at < uploadingMs ? [itemId] : [])).join(","),
    freshEmails: emails.flatMap((email) => (t - email.arrivedAt < freshMs ? [email.kind] : [])).join(","),
  };
}

type Props = { state: FilmState; moment: ClientMoment; profile: CompanyProfile; framed: boolean; timeAt: (filmMs: number) => string };

function emailsOf({ state, moment, profile, timeAt }: Props) {
  const outstanding = filmOutstanding();
  const compose = { request: requestMessage(profile), "follow-up": followUpEmail(profile, outstanding), reminder: reminderEmail(profile, outstanding) };
  return state.client.emails.map((email) =>
    inboxEmail(profile, email.kind, compose[email.kind], {
      id: email.kind,
      time: timeAt(email.arrivedAt),
      unread: state.client.openEmail !== email.kind,
      fresh: moment.freshEmails.split(",").includes(email.kind),
    }),
  );
}

function uploadRows({ state, moment }: Props): UploadRow[] {
  const results = resultsByItem(state);
  return state.checklist.map((item) => {
    const dropped = isUploadItemId(item.id) ? state.client.dropped[item.id] : undefined;
    return {
      item: requestItem(item.id),
      state: item.state,
      file: dropped && { name: dropped.fileName, uploading: moment.uploading.split(",").includes(item.id) },
      reason: reasonFor(item.id, state, results[item.id]),
    };
  });
}

/** Daniel's phone in the film: the same screens live mode uses, without anyone tapping them. */
export const FilmClientLane = memo(function FilmClientLane(props: Props) {
  const { state, moment, profile, framed } = props;
  const { screen, openEmail, signedAt } = state.client;
  const emails = emailsOf(props);
  const open = emails.find((email) => email.kind === openEmail);
  const signing = moment.signing;

  let content;
  if (screen === "email" && open) {
    content = (
      <EmailView
        email={open}
        action={open.kind === "request" ? <Button variant="brand" size="sm">Upload and sign</Button> : undefined}
      />
    );
  } else if (screen === "upload") {
    content = <UploadPage profile={profile} rows={uploadRows(props)} />;
  } else if (screen === "letter") {
    content = (
      <div className="px-4 py-4">
        <EngagementLetter
          profile={profile}
          signature={{ kind: "drawn", progress: signing }}
          stamp={signing >= 1 && signedAt !== undefined ? `Signed ${props.timeAt(signedAt + signingMs)}` : undefined}
        />
      </div>
    );
  } else {
    content = <PhoneInbox emails={emails} />;
  }

  return (
    <ClientPhone framed={framed} time={moment.clock} screenKey={`${screen}-${openEmail ?? ""}`} inert>
      {content}
    </ClientPhone>
  );
});
