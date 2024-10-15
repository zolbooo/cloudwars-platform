import { z } from "zod";

export const gameStatusSchema = z.object({
  status: z.enum(["pending", "running", "finished"]),
  currentRound: z.number().int().default(0),
  roundStartedAt: z.date().nullable(),
});
export type GameStatus = z.infer<typeof gameStatusSchema>;
