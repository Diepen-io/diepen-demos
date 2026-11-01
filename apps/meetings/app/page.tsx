import { BrandProvider } from "@diepen/ui/brand/brand-provider";
import { KeynoteFilmView } from "@diepen/ui/film/keynote-film-view";
import { DemoShell } from "@diepen/ui/shell/demo-shell";
import { defaultPresetFor } from "@diepen/voice/presets";
import { buildMeetingsKeynote } from "@/film/meetings-keynote";

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

/** The film, always in its own fictional company (decision F1). `?t=` opens it paused at a moment, `?record=1` without chrome. */
export default async function FilmPage({ searchParams }: PageProps) {
  const { brand } = await searchParams;
  const company = defaultPresetFor("meetings");
  return (
    <BrandProvider fixed defaultProfile={company} brandParamValue={typeof brand === "string" ? brand : null}>
      <DemoShell title="Call to close" mode="film" presets={[company]} fit>
        <KeynoteFilmView film={buildMeetingsKeynote(company)} />
      </DemoShell>
    </BrandProvider>
  );
}
