import { BrandProvider } from "@diepen/ui/brand/brand-provider";
import { DemoShell } from "@diepen/ui/shell/demo-shell";
import { defaultPresetFor } from "@diepen/voice/presets";
import { InboxFilm } from "@/ui/inbox-film";

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

/** The film: one night of messages at a fictional business, from recorded fixtures. */
export default async function FilmPage({ searchParams }: PageProps) {
  const { brand } = await searchParams;
  return (
    <BrandProvider fixed defaultProfile={defaultPresetFor("inbox")} brandParamValue={typeof brand === "string" ? brand : null}>
      <DemoShell title="Inbox autopilot" mode="film" fit>
        <InboxFilm />
      </DemoShell>
    </BrandProvider>
  );
}
