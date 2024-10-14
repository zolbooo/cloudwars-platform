import { z } from "zod";

export const setupGameActionSchema = z.strictObject({
  maxTeams: z.number().default(10),
  teamMaxSize: z.number().default(5),
  startDate: z
    .string()
    .datetime()
    .transform((v) => new Date(v)),
  endDate: z
    .string()
    .datetime()
    .transform((v) => new Date(v)),
  roundDurationMinutes: z.number().default(5),
  flagLifetimeRounds: z.number().default(3),
  scoreWeights: z
    .strictObject({
      attack: z.number().default(1),
      defense: z.number().default(1),
      availability: z.number().default(1),
    })
    .default({}),
});
export type SetupGameActionInput = z.input<typeof setupGameActionSchema>;
