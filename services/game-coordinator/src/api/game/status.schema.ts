import { z } from "zod";

export const gameStatusSchema = z.object({
  status: z.enum(["pending", "running", "paused", "finished"]),
  currentRound: z.number().int().default(0),
  roundStartedAt: z.date().nullable(),
  lastCheckAt: z.date().nullable(),
});
export type GameStatus = z.infer<typeof gameStatusSchema>;
