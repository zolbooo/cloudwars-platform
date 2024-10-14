import { z } from "zod";

export const loginActionSchema = z.strictObject({
  username: z.string(),
  password: z.string(),
});
export type LoginActionInput = z.input<typeof loginActionSchema>;
