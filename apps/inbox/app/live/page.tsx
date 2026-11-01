import { BrandProvider } from "@diepen/ui/brand/brand-provider";
import { DemoShell } from "@diepen/ui/shell/demo-shell";
import { defaultPresetFor } from "@diepen/voice/presets";
import { container } from "@/infrastructure/container";
import { LiveInbox } from "@/ui/live-inbox";

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

/** Live mode: the visitor writes as a customer and the assistant answers in the company's voice. */
export default async function LivePage({ searchParams }: PageProps) {
  const { brand } = await searchParams;
  return (
    <BrandProvider defaultProfile={defaultPresetFor("inbox")} brandParamValue={typeof brand === "string" ? brand : null}>
      <DemoShell title="Inbox autopilot" mode="live">
        <LiveInbox providerName={container.providerName} />
      </DemoShell>
    </BrandProvider>
  );
}
