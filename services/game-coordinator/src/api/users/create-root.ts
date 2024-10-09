"use server";
import argon2 from "argon2";

import { users } from "@/models/users";

import { CreateRootUserActionInput } from "./create-root.schema";

export async function createRootUserAction(input: CreateRootUserActionInput) {
  const passwordHash = await argon2.hash(input.password);
  return await users.createRootUser({ username: input.username, passwordHash });
}
