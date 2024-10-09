import { z } from "zod";

export const createRootUserActionSchema = z.strictObject({
  username: z.string(),
  password: z.string(),
});
export type CreateRootUserActionInput = z.infer<
  typeof createRootUserActionSchema
>;
