"use server";
import argon2 from "argon2";

import { users } from "@/models/users";

import { RegisterActionInput, registerActionSchema } from "./register.schema";

export async function registerAction(input: RegisterActionInput) {
  const { username, password } = registerActionSchema.parse(input);
  const passwordHash = await argon2.hash(password);
  return await users.register({ username, passwordHash });
}

export async function createRootUserAction(input: RegisterActionInput) {
  const { username, password } = registerActionSchema.parse(input);
  const passwordHash = await argon2.hash(password);
  return await users.createRootUser({ username, passwordHash });
}
