import { createBrandHandler } from "@diepen/voice/brand-route";
import { container } from "@/infrastructure/container";

/** "Make it yours": drafts a profile from a website, through the container's page fetcher. */
export const POST = createBrandHandler({
  fetchPage: container.fetchPage,
  provider: container.provider,
  guards: container.guards,
});
