import { getContainer } from "@/infrastructure/container";

/** "Make it yours": reads a website and drafts a company profile. Request and response are the package's. */
export function POST(request: Request): Promise<Response> {
  return getContainer().handleBrandRequest(request);
}
