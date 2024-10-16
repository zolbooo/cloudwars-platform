import { z } from "zod";

export const joinTeamActionSchema = z.strictObject({
  name: z.string(),
  password: z.string(),
});
export type JoinTeamActionInput = z.input<typeof joinTeamActionSchema>;
