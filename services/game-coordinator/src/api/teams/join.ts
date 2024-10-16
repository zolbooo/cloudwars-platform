"use server";
import argon2 from "argon2";

import { getSession } from "@/core/auth/session";

import { users } from "@/models/users";
import { teams } from "@/models/teams";
import { metadata } from "@/models/metadata";
import { runTransaction } from "@/models/db";

import { JoinTeamActionInput, joinTeamActionSchema } from "./join.schema";

export async function joinTeamAction(input: JoinTeamActionInput) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "unauthorized" } as const;
  }

  const { name, password } = joinTeamActionSchema.parse(input);
  return await runTransaction(async () => {
    const user = await users.getById(session.uid);
    if (!user) {
      return { success: false, error: "user_not_found" } as const;
    }
    if (user.teamId !== null) {
      return { success: false, error: "you_already_joined_team" } as const;
    }

    const gameSettings = await metadata.getGameSettings();
    if (!gameSettings) {
      return { success: false, error: "setup_required" } as const;
    }

    const team = await teams.getByName(name);
    if (!team) {
      return { success: false, error: "team_not_found" } as const;
    }
    if (team.memberIds.length >= gameSettings.teamMaxSize) {
      return { success: false, error: "team_max_size_reached" } as const;
    }

    const isTeamPasswordVerified = await argon2.verify(
      team.teamPasswordHash,
      password
    );
    if (!isTeamPasswordVerified) {
      return { success: false, error: "incorrect_team_password" } as const;
    }

    await teams.addMember(team.id, session.uid);
    await users.edit(session.uid, { teamId: team.id });
    return { success: true } as const;
  });
}
