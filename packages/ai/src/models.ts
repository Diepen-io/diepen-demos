/** Which Claude model does which job. Chat must feel instant; checks and extraction must be right. */
export const models = {
  chat: "claude-haiku-5-5",
  analysis: "claude-sonnet-5-5",
} as const;

export type ModelRole = keyof typeof models;
