"use client";

import { clientReason } from "@/domain/client-reasons";
import { isUploadItemId, requestItem } from "@/domain/document-request";
import { Button } from "@diepen/ui/primitives/button";
import type { CompanyProfile } from "@diepen/voice/profile";
import { ClientPhone } from "./client-phone";
import { EmailView, PhoneInbox } from "./email-views";
import { EngagementLetter } from "./engagement-letter";
import type { UploadRow } from "./upload-item";
import { UploadPage } from "./upload-page";
import { SignaturePad } from "./signature-pad";
import type { LiveState } from "./live-state";
import type { useLiveDemo } from "./use-live-demo";

type Actions = ReturnType<typeof useLiveDemo>["actions"];

export type LiveClientLaneProps = {
  state: LiveState;
  profile: CompanyProfile;
  actions: Actions;
  framed: boolean;
  onDone: () => void;
  busy: boolean;
};

function rowsOf(state: LiveState): UploadRow[] {
  return state.items.map((item) => {
    const result = state.results[item.id];
    const fileName = isUploadItemId(item.id) ? state.lastFile[item.id] : undefined;
    return {
      item: requestItem(item.id),
      state: item.state,
      file: fileName ? { name: fileName, uploading: item.state === "received" } : undefined,
      reason:
        item.state === "problem" && result
          ? clientReason(requestItem(item.id), { state: "problem", issues: result.issues, detectedYear: result.year, detectedPerson: result.person })
          : undefined,
      error: state.rowErrors[item.id],
    };
  });
}

/** Daniel's phone in live mode: the visitor plays the client. */
export function LiveClientLane({ state, profile, actions, framed, onDone, busy }: LiveClientLaneProps) {
  const open = state.emails.find((email) => email.id === state.openEmailId);
  let content;
  if (state.screen === "email" && open) {
    const label = open.kind === "request" ? "Upload and sign" : "Upload documents";
    content = (
      <EmailView
        email={open}
        onBack={() => actions.show("inbox")}
        action={<Button variant="brand" size="sm" onClick={() => actions.show("upload")}>{label}</Button>}
      />
    );
  } else if (state.screen === "upload") {
    content = (
      <UploadPage
        profile={profile}
        rows={rowsOf(state)}
        onBack={() => actions.show("inbox")}
        onDone={onDone}
        doneDisabled={busy}
        actionsFor={(row) => ({
          onFile: (file) => {
            if (isUploadItemId(row.item.id)) void actions.upload(row.item.id, file);
          },
          onSample: (sample) => void actions.pickSample(sample),
          onReviewSign: () => actions.show("letter"),
        })}
      />
    );
  } else if (state.screen === "letter") {
    content = (
      <div className="px-4 py-4">
        <EngagementLetter profile={profile} signature={state.signature}>
          <SignaturePad onSign={actions.sign} onCancel={() => actions.show("upload")} />
        </EngagementLetter>
      </div>
    );
  } else {
    content = <PhoneInbox emails={state.emails} onOpen={actions.openEmail} />;
  }
  return (
    <ClientPhone framed={framed} time={state.now.slice(11, 16)} screenKey={`${state.screen}-${state.openEmailId ?? ""}`}>
      {content}
    </ClientPhone>
  );
}
