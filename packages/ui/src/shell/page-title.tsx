"use client";

import { createContext, use, type ReactNode } from "react";

/** True inside a frame that already holds the page's one h1, such as `DemoShell`. */
export const PageTitleContext = createContext(false);

/** A component's own title: an h2 under a shell's h1, else the page's h1. */
export function PageTitle({ className, children }: { className?: string; children: ReactNode }) {
  return use(PageTitleContext) ? <h2 className={className}>{children}</h2> : <h1 className={className}>{children}</h1>;
}
