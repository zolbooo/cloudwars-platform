"use server";
import { metadata } from "@/models/metadata";
import { getSession } from "@/core/auth/session";

import { SetupGameActionInput, gameSettingsSchema } from "./setup.schema";

export async function setupGameAction(input: SetupGameActionInput) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "unauthorized" } as const;
  }
  if (session.role !== "admin") {
    return { success: false, error: "forbidden" } as const;
  }

  const settings = gameSettingsSchema.parse(input);
  await metadata.updateGameSettings(settings);
  return { success: true } as const;
}
