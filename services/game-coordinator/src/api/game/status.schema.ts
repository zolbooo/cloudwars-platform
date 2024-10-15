import { z } from "zod";

export const gameStatusSchema = z.object({
  status: z.enum(["pending", "running", "finished"]),
});
export type GameStatus = z.infer<typeof gameStatusSchema>;
