import { z } from "zod";

/** The four places a customer can write from. */
export const channels = ["email", "instagram", "linkedin", "chat"] as const;

export const channelSchema = z.enum(channels);

export type Channel = z.infer<typeof channelSchema>;

export const channelLabels: Record<Channel, string> = {
  email: "Email",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  chat: "Website chat",
};
