"use client";

import { isComplete } from "@/domain/checklist";
import { Lane } from "@diepen/ui/film/lane";
import { LaneTabs } from "@diepen/ui/film/lane-tabs";
import { useNarrowScreen } from "@diepen/ui/film/use-stage-environment";
import { cx } from "@diepen/ui/primitives/class-names";
import { useState, type CSSProperties, type ReactNode } from "react";
import { documentsGridColumns, documentsLanes, type DocumentsLaneId } from "./documents-lanes";
import { LiveClientLane } from "./live-client-lane";
import { LiveDriveLane, LiveFirmLane, LiveSystemLane } from "./live-side-lanes";
import { LiveToolbar } from "./live-toolbar";
import { useLiveDemo } from "./use-live-demo";

/** Live mode has no travelling items, so the tabs need no anchors. */
const noAnchor = () => () => undefined;

function Fill({ children }: { children: ReactNode }) {
  return <div className="absolute inset-3 md:inset-4">{children}</div>;
}

/** The `/live` layout: the film's four lanes, with the visitor playing Daniel on the phone. */
export function LiveDemo({ providerName }: { providerName: string }) {
  const { state, profile, actions, chase } = useLiveDemo();
  const narrow = useNarrowScreen();
  const [shown, setShown] = useState<DocumentsLaneId>("client");
  const [busy, setBusy] = useState(false);
  const lanes = documentsLanes(profile);
  const done = isComplete(state.items);

  async function run(event: "submitted" | "skip-days") {
    setBusy(true);
    await chase(state, event);
    setBusy(false);
  }

  function select(lane: string) {
    setShown(lane as DocumentsLaneId);
    actions.seen(lane as DocumentsLaneId);
  }

  const content: Record<DocumentsLaneId, ReactNode> = {
    firm: <Fill><LiveFirmLane state={state} /></Fill>,
    client: (
      <Fill>
        <LiveClientLane state={state} profile={profile} actions={actions} framed={!narrow} busy={busy} onDone={() => void run("submitted")} />
      </Fill>
    ),
    system: <LiveSystemLane state={state} />,
    drive: <Fill><LiveDriveLane state={state} firmName={profile.name} /></Fill>,
  };

  return (
    <div className="flex min-h-0 flex-col gap-3 px-4 pt-4 pb-4 md:flex-1 md:basis-0 md:gap-5 md:px-8 md:pt-6 md:pb-6 2xl:px-12">
      <LiveToolbar
        now={state.now}
        providerName={providerName}
        canSkip={!busy && !done && !state.session.escalated}
        onSkip={() => void run("skip-days")}
        onStartOver={() => {
          actions.startOver();
          setShown("client");
        }}
      />
      {narrow && (
        <LaneTabs
          lanes={lanes}
          shownLane={shown}
          receiving={new Set(state.changed.filter((lane) => lane !== shown))}
          onSelect={select}
          register={noAnchor}
        />
      )}
      <div
        className="grid min-h-0 flex-1 grid-cols-1 gap-4 md:grid-cols-[var(--live-columns)] 2xl:gap-6"
        style={{ "--live-columns": documentsGridColumns } as CSSProperties}
      >
        {lanes.map((lane) => (
          <Lane
            key={lane.id}
            id={`film-lane-${lane.id}`}
            lane={lane}
            focused={narrow ? false : lane.id === "client"}
            className={cx("max-md:h-[calc(100dvh-120px)] max-md:min-h-[520px]", narrow && lane.id !== shown && "hidden")}
          >
            {content[lane.id as DocumentsLaneId]}
          </Lane>
        ))}
      </div>
    </div>
  );
}
