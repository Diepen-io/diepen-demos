import type { IconName } from "../primitives/icon";

export type ChannelId = "email" | "instagram" | "linkedin" | "chat";

/** How each customer channel is named and marked, everywhere in the kit. */
export const channelLooks: Record<ChannelId, { label: string; icon: IconName; accent: string }> = {
  email: { label: "Email", icon: "mail", accent: "var(--channel-email)" },
  instagram: { label: "Instagram", icon: "chat", accent: "var(--channel-instagram)" },
  linkedin: { label: "LinkedIn", icon: "briefcase", accent: "var(--channel-linkedin)" },
  chat: { label: "Website chat", icon: "globe", accent: "var(--muted)" },
};

export const channelOrder: readonly ChannelId[] = ["email", "instagram", "linkedin", "chat"];
