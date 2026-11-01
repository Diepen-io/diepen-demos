"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

/** A lane registers its body and content column, and on narrow screens its tab. */
export type LaneAnchorPart = "body" | "content" | "tab";

export type AnchorPoint = { x: number; y: number };

export type LaneAnchors = {
  /** A stable ref callback for one part of one lane. */
  register: (laneId: string, part: LaneAnchorPart) => (element: HTMLElement | null) => void;
  /** Where an item leaves from or lands in a lane, relative to the container. */
  point: (laneId: string, mode: "lanes" | "tabs") => AnchorPoint | null;
  /** The container's size, so an item can be kept inside it. */
  size: { width: number; height: number };
};

type Box = { left: number; top: number; width: number; height: number };
type Measured = { body?: Box; contentBottom?: number; tab?: Box };

/** Keeps an item from landing on the lane header or below the visible body. */
const LANDING_INSET = 56;
const SEPARATOR = "\u0000";

/**
 * Measures lane positions relative to `container` with a ResizeObserver, so travelling items
 * fly between the real lanes after any resize, a new item, or a switch to the narrow layout.
 */
export function useLaneAnchors(container: RefObject<HTMLElement | null>): LaneAnchors {
  const elementsRef = useRef(new Map<string, HTMLElement>());
  const callbacksRef = useRef(new Map<string, (element: HTMLElement | null) => void>());
  const observerRef = useRef<ResizeObserver | null>(null);
  const [measured, setMeasured] = useState<ReadonlyMap<string, Measured>>(new Map());
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const root = container.current;
    if (!root) return;
    const elements = elementsRef.current;
    const measure = () => {
      const origin = root.getBoundingClientRect();
      const next = new Map<string, Measured>();
      for (const [key, element] of elements) {
        const [laneId = "", part] = key.split(SEPARATOR);
        const entry = next.get(laneId) ?? {};
        if (part === "content") {
          // offsetTop ignores transforms, so a feed that is mid-slide reports where it settles.
          entry.contentBottom = element.offsetTop + element.offsetHeight;
        } else if (part === "body" || part === "tab") {
          const rect = element.getBoundingClientRect();
          entry[part] = { left: rect.left - origin.left, top: rect.top - origin.top, width: rect.width, height: rect.height };
        }
        next.set(laneId, entry);
      }
      setMeasured(next);
      setSize((current) =>
        current.width === origin.width && current.height === origin.height
          ? current
          : { width: origin.width, height: origin.height },
      );
    };
    const observer = new ResizeObserver(measure);
    observerRef.current = observer;
    observer.observe(root);
    for (const element of elements.values()) observer.observe(element);
    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [container]);

  const register = useCallback((laneId: string, part: LaneAnchorPart) => {
    const key = `${laneId}${SEPARATOR}${part}`;
    let callback = callbacksRef.current.get(key);
    if (!callback) {
      callback = (element) => {
        const previous = elementsRef.current.get(key);
        if (previous) observerRef.current?.unobserve(previous);
        if (element) {
          elementsRef.current.set(key, element);
          observerRef.current?.observe(element);
        } else {
          elementsRef.current.delete(key);
        }
      };
      callbacksRef.current.set(key, callback);
    }
    return callback;
  }, []);

  const point = useCallback(
    (laneId: string, mode: "lanes" | "tabs"): AnchorPoint | null => {
      const lane = measured.get(laneId);
      if (mode === "tabs") {
        return lane?.tab ? { x: lane.tab.left + lane.tab.width / 2, y: lane.tab.top + lane.tab.height / 2 } : null;
      }
      const body = lane?.body;
      if (!body || body.width === 0) return null;
      const landing = (lane.contentBottom ?? 0) + 28;
      const y = Math.min(Math.max(landing, LANDING_INSET), Math.max(LANDING_INSET, body.height - LANDING_INSET));
      return { x: body.left + body.width / 2, y: body.top + y };
    },
    [measured],
  );

  return { register, point, size };
}
