"use server";
import { users } from "@/models/users";
import { getSession } from "@/core/auth/session";
import { generateApiKey } from "@/core/auth/api-keys";

export async function createApiKeyAction() {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "unauthorized" } as const;
  }

  const { apiKey, signature, maskedApiKey } = await generateApiKey(session.uid);
  await users.edit(session.uid, {
    apiKey: {
      signature,
      masked: maskedApiKey,
    },
  });
  return { success: true, apiKey } as const;
}
