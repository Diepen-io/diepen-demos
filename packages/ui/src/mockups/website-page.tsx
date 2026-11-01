import type { CompanyProfile } from "@diepen/voice/profile";
import type { ReactNode } from "react";
import { BrandMark } from "../brand/brand-mark";
import { Icon } from "../primitives/icon";

export type WebsitePageProps = {
  company: Pick<CompanyProfile, "name" | "logo" | "colors">;
  tagline?: string;
  /** Navigation labels, for example ["Treatments", "Prices", "Contact"]. */
  links?: string[];
  /** Items listed under the hero, for example the company's services. */
  highlights?: string[];
  /** The open chat window, pinned to the bottom right corner. */
  children: ReactNode;
};

/** The company's own website behind its chat widget, so the chat reads as part of a real site. */
export function WebsitePage({ company, tagline, links = ["Services", "Prices", "Contact"], highlights = [], children }: WebsitePageProps) {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[#fbfbfa]">
      <div aria-hidden="true" className="flex min-h-0 flex-1 flex-col">
        <nav className="flex items-center gap-3 border-b border-border bg-surface px-5 py-3">
          <BrandMark profile={company} size={28} />
          <span className="min-w-0 flex-1 truncate text-[15px] font-semibold">{company.name}</span>
          <span className="hidden gap-5 text-sm text-muted @xl:flex">
            {links.map((link) => (
              <span key={link}>{link}</span>
            ))}
          </span>
        </nav>
        <div className="flex flex-col gap-4 px-6 pt-10 pb-6 @xl:max-w-[60%] @xl:px-10 @xl:pt-14">
          <h3 className="text-[28px] leading-[1.1] font-semibold tracking-[-0.025em] text-foreground @xl:text-[36px]">{company.name}</h3>
          {tagline && <p className="text-[17px] text-muted">{tagline}</p>}
          <span className="inline-flex h-10 w-fit items-center rounded-full bg-brand px-5 text-sm font-semibold text-brand-foreground">
            Book an appointment
          </span>
          {highlights.length > 0 && (
            <ul className="mt-4 flex flex-col gap-2">
              {highlights.map((item) => (
                <li key={item} className="flex items-center gap-2 text-body text-muted">
                  <Icon name="check" size={16} className="shrink-0 text-brand" /> {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="absolute right-3 bottom-3 left-3 flex flex-col items-end gap-3 @sm:left-auto">
        <div className="flex h-[min(34rem,calc(100cqh-5.5rem))] w-full flex-col overflow-hidden rounded-2xl bg-surface shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_24px_48px_-12px_rgb(0_0_0/0.25)] @sm:w-[min(22rem,calc(100cqw-5rem))]">
          {children}
        </div>
        <span aria-hidden="true" className="inline-flex size-12 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-[0_8px_20px_-6px_rgb(0_0_0/0.35)]">
          <Icon name="close" size={20} strokeWidth={2} />
        </span>
      </div>
    </div>
  );
}
