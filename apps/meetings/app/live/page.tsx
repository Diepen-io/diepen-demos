import { BrandProvider } from "@diepen/ui/brand/brand-provider";
import { DemoShell } from "@diepen/ui/shell/demo-shell";
import { defaultPresetFor } from "@diepen/voice/presets";
import { sampleCall } from "@/film/fixtures/sample-call";
import { container } from "@/infrastructure/container";
import { LiveDemo } from "@/ui/live/live-demo";

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

/** Live mode: the visitor brings a call and Claude drafts the follow-up in the active profile. */
export default async function LivePage({ searchParams }: PageProps) {
  const { brand } = await searchParams;
  const company = defaultPresetFor("meetings");
  return (
    <BrandProvider defaultProfile={company} brandParamValue={typeof brand === "string" ? brand : null}>
      <DemoShell title="Call to close" mode="live" presets={[company]}>
        <LiveDemo providerName={container.providerName} sampleCall={sampleCall} />
      </DemoShell>
    </BrandProvider>
  );
}
