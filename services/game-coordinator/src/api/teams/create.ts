"use server";
import argon2 from "argon2";

import { getSession } from "@/core/auth/session";

import { teams } from "@/models/teams";
import { users } from "@/models/users";
import { runTransaction } from "@/models/db";

import { CreateTeamActionInput, createTeamActionSchema } from "./create.schema";

export async function createTeamAction(input: CreateTeamActionInput) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "unauthorized" } as const;
  }

  const { name, password } = createTeamActionSchema.parse(input);
  const teamPasswordHash = await argon2.hash(password);
  return await runTransaction(async () => {
    if (await teams.getByName(name)) {
      return { success: false, error: "team_name_already_taken" } as const;
    }
    const id = (await teams.getTotalTeams()) + 1;
    await teams.create({ id, name, teamPasswordHash });
    await users.edit(session.uid, { teamId: id });
    return { success: true } as const;
  });
}
