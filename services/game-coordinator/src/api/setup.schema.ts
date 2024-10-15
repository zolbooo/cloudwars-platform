import { z } from "zod";

export const gameSettingsSchema = z.strictObject({
  maxTeams: z.number().int().positive().default(10),
  teamMaxSize: z.number().int().positive().default(5),
  instanceRevealDate: z
    .string()
    .datetime()
    .transform((value) => new Date(value)),
  startDate: z
    .string()
    .datetime()
    .transform((value) => new Date(value))
    .refine(
      (startDate) => startDate > new Date(),
      "Start date must be in the future"
    ),
  roundDurationMinutes: z.number().int().positive().default(5),
  gameDurationRounds: z.number().int().positive(),
  flagLifetimeRounds: z.number().int().positive().default(3),
  scoreWeights: z
    .strictObject({
      attack: z.number().default(1),
      defense: z.number().default(1),
      availability: z.number().default(1),
    })
    .default({}),
});
export type SetupGameActionInput = z.input<typeof gameSettingsSchema>;
export type GameSettings = z.infer<typeof gameSettingsSchema>;
