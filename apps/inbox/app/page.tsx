import { BrandProvider } from "@diepen/ui/brand/brand-provider";
import { KeynoteFilmView } from "@diepen/ui/film/keynote-film-view";
import { DemoShell } from "@diepen/ui/shell/demo-shell";
import { defaultPresetFor } from "@diepen/voice/presets";
import { buildInboxKeynote } from "@/film/inbox-keynote";

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

/** The film: one night of messages at a fictional business, from recorded fixtures. */
export default async function FilmPage({ searchParams }: PageProps) {
  const { brand } = await searchParams;
  const company = defaultPresetFor("inbox");
  return (
    <BrandProvider fixed defaultProfile={company} brandParamValue={typeof brand === "string" ? brand : null}>
      <DemoShell title="Inbox autopilot" mode="film" fit>
        <KeynoteFilmView film={buildInboxKeynote(company)} />
      </DemoShell>
    </BrandProvider>
  );
}
