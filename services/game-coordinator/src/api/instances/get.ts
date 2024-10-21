import "server-only";
import { isAfter } from "date-fns";

import { users } from "@/models/users";
import { metadata } from "@/models/metadata";
import { getSession } from "@/core/auth/session";
import { getGameInstance } from "@/core/instances/get";

export interface GameInstance {
  name: string;
  zone: string;
  publicIP: string;
  internalIP: string;
  teamId: number;
}

export async function getTeamInstance() {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "unauthorized" } as const;
  }

  const gameSettings = await metadata.getGameSettings();
  if (!gameSettings) {
    return { success: false, error: "setup_required" } as const;
  }

  const user = await users.getById(session.uid);
  if (!user) {
    return { success: false, error: "user_not_found" } as const;
  }
  if (user.teamId === null) {
    return { success: false, error: "you_have_not_joined_team" } as const;
  }

  if (isAfter(gameSettings.instanceRevealDate, new Date())) {
    return { success: false, error: "instance_not_available_yet" } as const;
  }

  const instance = await getGameInstance(user.teamId);
  if (!instance) {
    return { success: false, error: "instance_not_found" } as const;
  }
  return { success: true, instance } as const;
}
