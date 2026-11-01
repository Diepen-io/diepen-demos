import { BrandProvider } from "@diepen/ui/brand/brand-provider";
import { defaultPresetFor } from "@diepen/voice/presets";
import { MeetingsFilmStage } from "@/ui/film-view/meetings-film-stage";

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

/** The film, always in its own fictional company (decision F1). `?t=` opens it paused at a moment, `?record=1` without chrome. */
export default async function FilmPage({ searchParams }: PageProps) {
  const { brand } = await searchParams;
  return (
    <BrandProvider fixed defaultProfile={defaultPresetFor("meetings")} brandParamValue={typeof brand === "string" ? brand : null}>
      <MeetingsFilmStage />
    </BrandProvider>
  );
}
