"use client";

import { companyProfileSchema, type CompanyProfile } from "@diepen/voice/profile";
import { presetList } from "@diepen/voice/presets";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "../primitives/button";
import { Icon } from "../primitives/icon";
import { Input } from "../primitives/input";
import { Sheet } from "../primitives/sheet";
import { ProviderNote } from "../shell/provider-note";
import { useBrand } from "./brand-provider";
import { normalizeWebsite, requestBrandProfile } from "./brand-request";
import { ExtractionProgress } from "./extraction-progress";
import { PresetPicker } from "./preset-picker";
import { ProfileForm } from "./profile-form";

type Lookup =
  | { state: "idle" }
  | { state: "loading"; host: string }
  | { state: "error"; message: string }
  | { state: "done"; host: string; provider: string };

export type MakeItYoursProps = {
  open: boolean;
  onClose: () => void;
  /** The example companies on offer. A demo whose story fits one industry offers only its own (decision F3). */
  presets?: readonly CompanyProfile[];
};

/** Turns the demo into the visitor's company: read their website, edit the draft, apply it. */
export function MakeItYours({ open, onClose, presets = presetList }: MakeItYoursProps) {
  const { savedProfile, setProfile, resetProfile, defaultProfile, fixed, shareHref } = useBrand();
  const [draft, setDraft] = useState(savedProfile);
  // A new draft remounts the form, so fields that keep their own text start from it.
  const [draftVersion, setDraftVersion] = useState(0);
  const [website, setWebsite] = useState("");
  const [lookup, setLookup] = useState<Lookup>({ state: "idle" });
  const [applyError, setApplyError] = useState<string | null>(null);
  const [copied, setCopied] = useState<"idle" | "copied" | "failed">("idle");
  const request = useRef<AbortController | null>(null);

  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) loadDraft(savedProfile);
  }

  useEffect(() => () => request.current?.abort(), []);

  function loadDraft(next: CompanyProfile) {
    setDraft(next);
    setDraftVersion((version) => version + 1);
    setApplyError(null);
  }

  async function onLookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const url = normalizeWebsite(website);
    if (!url) {
      setLookup({ state: "error", message: "Enter a website address like yourcompany.com." });
      return;
    }
    request.current?.abort();
    request.current = new AbortController();
    const host = new URL(url).hostname;
    setLookup({ state: "loading", host });
    const result = await requestBrandProfile(url, request.current.signal);
    if (request.current.signal.aborted) return;
    if (!result.ok) {
      setLookup({ state: "error", message: result.message });
      return;
    }
    loadDraft(result.profile);
    setLookup({ state: "done", host, provider: result.provider });
  }

  function onApply() {
    const parsed = companyProfileSchema.safeParse(draft);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      setApplyError(issue ? `${issue.path.join(" ")}: ${issue.message}` : "Some fields are incomplete.");
      return;
    }
    setProfile(parsed.data);
    onClose();
  }

  function onPreset(preset: CompanyProfile) {
    setProfile(preset);
    loadDraft(preset);
    setLookup({ state: "idle" });
  }

  async function onCopyLink() {
    try {
      await navigator.clipboard.writeText(shareHref());
      setCopied("copied");
    } catch {
      setCopied("failed");
    }
    setTimeout(() => setCopied("idle"), 2400);
  }

  const footer = (
    <div className="flex flex-col gap-3">
      {applyError && <p role="alert" className="text-[13px] text-fail">{applyError}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => { resetProfile(); loadDraft(defaultProfile); }}>
          Reset to preset
        </Button>
        <Button variant="secondary" size="sm" onClick={onCopyLink} className="ml-auto">
          <Icon name={copied === "copied" ? "check" : "link"} size={14} />
          {copied === "copied" ? "Link copied" : copied === "failed" ? "Copy from the address bar" : "Copy link"}
        </Button>
        <Button size="sm" onClick={onApply}>Apply</Button>
      </div>
      <p className="text-[13px] text-faint">
        {fixed ? "Apply opens live mode in your brand. " : ""}Your profile lives in this browser and in the link you copy.
      </p>
    </div>
  );

  return (
    <Sheet open={open} onClose={onClose} title="Make it yours" description={fixed ? "Run live mode with your company's name, colours and voice." : "Run this demo with your company's name, colours and voice."} footer={footer}>
      <form onSubmit={onLookup} className="flex flex-col gap-2">
        <label htmlFor="make-it-yours-website" className="text-[13px] font-medium">Your website</label>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
          <Input
            id="make-it-yours-website"
            name="website"
            type="text"
            inputMode="url"
            autoComplete="url"
            placeholder="yourcompany.com"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
          />
          <Button type="submit" disabled={lookup.state === "loading"}>Read my site</Button>
        </div>
      </form>
      <div className="mt-3 flex flex-col gap-2 empty:hidden">
        {lookup.state === "loading" && <ExtractionProgress host={lookup.host} />}
        {lookup.state === "error" && <p role="alert" className="rounded-xl bg-fail-soft px-4 py-3 text-sm text-fail">{lookup.message}</p>}
        {lookup.state === "done" && (
          <p role="status" className="rounded-xl bg-pass-soft px-4 py-3 text-sm text-pass">
            Draft ready from {lookup.host}. Check it below, then apply.
          </p>
        )}
        {lookup.state === "done" && <ProviderNote providerName={lookup.provider} />}
      </div>

      <h3 className="mt-6 mb-2 text-sm font-semibold">{presets.length === 1 ? "Example company" : "Example companies"}</h3>
      <PresetPicker presets={presets} activeId={savedProfile.id} onPick={onPreset} />

      <h3 className="mt-7 text-sm font-semibold">Your profile</h3>
      <p className="mt-1 mb-4 text-[13px] text-muted">Every reply in the demo is written from these details.</p>
      <ProfileForm key={draftVersion} draft={draft} onChange={setDraft} />
    </Sheet>
  );
}
