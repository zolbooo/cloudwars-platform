import { z } from "zod";

export const tokenClaimsSchema = z.object({
  uid: z.string(),
  username: z.string(),
  role: z.enum(["user", "admin"]),
});
export type TokenClaims = z.infer<typeof tokenClaimsSchema>;
