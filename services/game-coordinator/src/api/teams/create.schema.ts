import { z } from "zod";

export const createTeamActionSchema = z.strictObject({
  name: z.string().trim().min(3).max(50),
  password: z.string(),
});
export type CreateTeamActionInput = z.input<typeof createTeamActionSchema>;
