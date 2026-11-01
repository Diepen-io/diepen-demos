"use client";

import { isUploadItemId, requestItem, type UploadItemId } from "@/domain/document-request";
import { ClientPhone, phoneFocusTarget, type PhoneFocus } from "@/ui/client-phone";
import { EmailView, PhoneInbox } from "@/ui/email-views";
import { EngagementLetter } from "@/ui/engagement-letter";
import { composeInboxEmail } from "@/ui/inbox-emails";
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
/** How long a new screen shows its top before the phone scrolls to what the caption is about. */
const readTopMs = 900;

/**
 * What changes inside one beat: the clock minute, the signature stroke, the upload bars and where
 * the screen is scrolled. The phone re-renders only when one of these changes, not on every frame.
 */
export type ClientMoment = { clock: string; signing: number; uploading: string; freshEmails: string; focus: string };

/** The upload row that changed last since the page opened, else the first file put in a slot. */
function uploadFocus(state: FilmState): UploadItemId | undefined {
  const { screenSince, dropped } = state.client;
  if (state.completeAt !== undefined && state.completeAt >= screenSince) return undefined;
  const changed = state.checklist
    .flatMap((item) => (isUploadItemId(item.id) && (state.rowChangedAt[item.id] ?? -1) >= screenSince ? [{ id: item.id, at: state.rowChangedAt[item.id] ?? 0 }] : []))
    .reduce<{ id: UploadItemId; at: number } | undefined>((latest, row) => (!latest || row.at > latest.at ? row : latest), undefined);
  if (changed) return changed.id;
  return state.checklist.find((item) => isUploadItemId(item.id) && (dropped[item.id]?.at ?? -1) >= screenSince)?.id as UploadItemId | undefined;
}

function focusAt(state: FilmState, t: number): PhoneFocus | undefined {
  const { screen, screenSince, openEmail } = state.client;
  const settled = t - screenSince >= readTopMs;
  if (screen === "email" && openEmail === "request" && settled) return { target: "email-action", block: "end" };
  if (screen === "letter" && settled) return { target: "signature", block: "end" };
  if (screen === "upload") {
    const row = uploadFocus(state);
    return row ? { target: row, block: "center" } : undefined;
  }
  return undefined;
}

export function clientMomentAt(state: FilmState, t: number, clock: string): ClientMoment {
  const { signedAt, dropped, emails } = state.client;
  const focus = focusAt(state, t);
  return {
    clock,
    signing: signedAt === undefined ? 0 : Math.min(1, Math.round(((t - signedAt) / signingMs) * 60) / 60),
    uploading: Object.entries(dropped).flatMap(([itemId, file]) => (t - file.at < uploadingMs ? [itemId] : [])).join(","),
    freshEmails: emails.flatMap((email) => (t - email.arrivedAt < freshMs ? [email.kind] : [])).join(","),
    focus: focus ? `${focus.target} ${focus.block}` : "",
  };
}

type Props = {
  state: FilmState;
  moment: ClientMoment;
  profile: CompanyProfile;
  framed: boolean;
  /** The clock minute at a film moment, "12:41". */
  timeAt: (filmMs: number) => string;
  /** The story time at a film moment, "2026-03-09T12:41". */
  storyAt: (filmMs: number) => string;
};

function emailsOf({ state, moment, profile, storyAt }: Props) {
  const outstanding = filmOutstanding();
  return state.client.emails.map((email) =>
    composeInboxEmail(profile, {
      id: email.kind,
      kind: email.kind,
      sentAt: storyAt(email.arrivedAt),
      outstanding,
      anyFileReceived: true,
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

function parseFocus(focus: string): PhoneFocus | undefined {
  const [target, block] = focus.split(" ");
  return target && (block === "start" || block === "center" || block === "end") ? { target, block } : undefined;
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
        action={
          open.kind === "request" ? (
            <span {...phoneFocusTarget("email-action")} className="inline-flex">
              <Button variant="brand" size="sm">Upload and sign</Button>
            </span>
          ) : undefined
        }
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
          stamp={signing >= 1 && signedAt !== undefined ? `Signed ${props.timeAt(signedAt)}` : undefined}
        />
      </div>
    );
  } else {
    content = <PhoneInbox emails={emails} />;
  }

  return (
    <ClientPhone framed={framed} time={moment.clock} screenKey={`${screen}-${openEmail ?? ""}`} focus={parseFocus(moment.focus)} inert>
      {content}
    </ClientPhone>
  );
});
