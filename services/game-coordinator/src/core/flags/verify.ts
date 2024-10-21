import { z } from "zod";
import { verifyJWT } from "jwt-gcp-kms";

import { getFlagSigningPublicKeys } from "./keys";

const flagSchema = z.object({
  round: z.number().int().positive(),
  team_id: z.number().int().nonnegative(),
  service_name: z.string(),
});
export type Flag = z.infer<typeof flagSchema>;

export async function verifyFlag(flag: string): Promise<Flag | null> {
  try {
    const claims = await verifyJWT(flag, await getFlagSigningPublicKeys());
    return flagSchema.parse(claims);
  } catch (e) {
    console.error("Error verifying flag:", e);
    return null;
  }
}
