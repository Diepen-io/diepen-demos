"use client";

import { easeInOut } from "./film-easing";
import type { ActiveTravel, FilmLane } from "./film-script";
import { TravelToken } from "./travel-token";
import type { AnchorPoint, LaneAnchors } from "./use-lane-anchors";

export type TravelLayerProps = {
  travels: ActiveTravel<unknown>[];
  lanes: FilmLane[];
  anchors: LaneAnchors;
  /** "tabs" flies between the lane tabs of the narrow layout. */
  mode: "lanes" | "tabs";
  reducedMotion: boolean;
};

/**
 * Draws every item in flight above the lanes. Position is a pure function of film time, so a
 * pause freezes the item mid-air and a seek lands it exactly. Only transform and opacity change.
 * There is no trail line: it crossed the lane content it flew over.
 */
export function TravelLayer({ travels, lanes, anchors, mode, reducedMotion }: TravelLayerProps) {
  const brandLanes = new Set(lanes.filter((lane) => lane.brand).map((lane) => lane.id));
  const flights = travels.flatMap((travel) => {
    const from = keepInside(anchors.point(travel.from, mode), mode, anchors.size.width);
    const to = keepInside(anchors.point(travel.to, mode), mode, anchors.size.width);
    return from && to ? [{ travel, ...flight(from, to, travel.progress, mode, reducedMotion) }] : [];
  });

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20">
      {flights.map(({ travel, position, opacity, scale }) => (
        <div
          key={travel.beat.id}
          className="absolute top-0 left-0 will-change-transform"
          style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)`, opacity }}
        >
          <div style={{ transform: `translate(-50%, -50%) scale(${scale})` }}>
            <TravelToken
              kind={travel.beat.travel.kind}
              label={travel.beat.travel.label}
              brand={brandLanes.has(travel.from)}
              compact={mode === "tabs"}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Half the widest compact token: a tab at the screen edge must not push the token off screen. */
const COMPACT_HALF_WIDTH = 110;

function keepInside(point: AnchorPoint | null, mode: "lanes" | "tabs", width: number): AnchorPoint | null {
  if (!point || mode === "lanes" || width < COMPACT_HALF_WIDTH * 2) return point;
  return { x: Math.min(Math.max(point.x, COMPACT_HALF_WIDTH), width - COMPACT_HALF_WIDTH), y: point.y };
}

/** The eased position on an arc, and the fade and scale at each end of the flight. */
function flight(from: AnchorPoint, to: AnchorPoint, progress: number, mode: "lanes" | "tabs", reduced: boolean) {
  const distance = Math.hypot(to.x - from.x, to.y - from.y);
  const lift = mode === "tabs" ? 0 : Math.min(96, distance * 0.16);
  const control = { x: (from.x + to.x) / 2, y: Math.min(from.y, to.y) - lift };
  if (reduced) {
    // No movement: the item fades in and out where it lands.
    return { position: to, opacity: Math.sin(Math.PI * progress), scale: 1 };
  }
  const eased = easeInOut(progress);
  const inverse = 1 - eased;
  const position = {
    x: inverse * inverse * from.x + 2 * inverse * eased * control.x + eased * eased * to.x,
    y: inverse * inverse * from.y + 2 * inverse * eased * control.y + eased * eased * to.y,
  };
  const opacity = Math.min(1, progress / 0.12, (1 - progress) / 0.16);
  const scale = 0.94 + 0.06 * Math.min(1, progress / 0.2) - 0.05 * Math.max(0, (progress - 0.82) / 0.18);
  return { position, opacity, scale };
}
