import { z } from "zod";

export const registerActionSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(64, "Password must be at most 64 characters long"),
});
export type RegisterActionInput = z.input<typeof registerActionSchema>;
