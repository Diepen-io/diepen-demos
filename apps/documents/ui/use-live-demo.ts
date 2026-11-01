"use client";

import type { UploadItemId } from "@/domain/document-request";
import type { SampleDocument } from "@/domain/sample-documents";
import { storyTimeFromMs, storyTimeToMs } from "@/domain/story-time";
import { useBrand } from "@diepen/ui/brand/brand-provider";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import type { LetterSignature } from "./engagement-letter";
import { guardFile } from "./file-guard";
import { postChase, postCheck, sampleFile } from "./live-api";
import { liveReducer } from "./live-session-reducer";
import { initialLiveState, liveStartsAt, sessionOf, type LiveState } from "./live-state";

/**
 * The live page's state and every action a visitor can take, wired to the two routes. The state
 * holds no text written from the profile: the lanes write it with the active profile.
 */
export function useLiveDemo() {
  const { profile, hrefWithBrand } = useBrand();
  const [state, dispatch] = useReducer(liveReducer, undefined, initialLiveState);
  const clock = useRef({ story: liveStartsAt, realMs: 0 });
  const checkCount = useRef(0);

  const storyNow = useCallback(() => {
    const { story, realMs } = clock.current;
    return storyTimeFromMs(storyTimeToMs(story) + Math.max(0, Date.now() - realMs));
  }, []);

  useEffect(() => {
    clock.current.realMs = Date.now();
    const timer = window.setInterval(() => dispatch({ type: "tick", now: storyNow() }), 1000);
    return () => window.clearInterval(timer);
  }, [storyNow]);

  const router = useRouter();
  const toFilm = useCallback(() => {
    const film = hrefWithBrand("/");
    router.push(`${film}${film.includes("?") ? "&" : "?"}fallback=limit`);
  }, [hrefWithBrand, router]);

  const upload = useCallback(
    async (itemId: UploadItemId, file: File) => {
      const guarded = await guardFile(file);
      if (!guarded.ok) return dispatch({ type: "file-rejected", itemId, message: guarded.message });
      const checkId = `check-${++checkCount.current}`;
      dispatch({ type: "check-started", checkId, itemId, fileName: file.name });
      const outcome = await postCheck(file, itemId, profile);
      if (outcome.kind === "fallback") return toFilm();
      dispatch(outcome.kind === "ok" ? { type: "check-finished", checkId, answer: outcome.answer } : { type: "check-aborted", checkId });
    },
    [profile, toFilm],
  );

  const pickSample = useCallback(
    async (sample: SampleDocument) => {
      const file = await sampleFile(sample.fileName);
      if (file) await upload(sample.itemId, file);
      else dispatch({ type: "file-rejected", itemId: sample.itemId, message: "The sample did not load. Try again." });
    },
    [upload],
  );

  const chase = useCallback(
    async (current: LiveState, event: "submitted" | "skip-days") => {
      const outcome = await postChase(sessionOf(current, storyNow()), event, profile);
      if (outcome.kind !== "ok") return;
      clock.current = { story: outcome.answer.session.now, realMs: Date.now() };
      dispatch({ type: "chase-answered", answer: outcome.answer, event });
    },
    [profile, storyNow],
  );

  const actions = useMemo(
    () => ({
      show: (screen: LiveState["screen"]) => dispatch({ type: "show", screen }),
      openEmail: (id: string) => dispatch({ type: "open-email", id }),
      sign: (signature: LetterSignature) => dispatch({ type: "signed", signature }),
      upload,
      pickSample,
      seen: (lane: LiveState["changed"][number]) => dispatch({ type: "seen", lane }),
      startOver: () => {
        clock.current = { story: liveStartsAt, realMs: Date.now() };
        dispatch({ type: "reset" });
      },
    }),
    [upload, pickSample],
  );

  return { state, profile, actions, chase };
}
