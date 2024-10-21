"use server";
import { users } from "@/models/users";
import { hashPassword } from "@/core/auth/password";

import { RegisterActionInput, registerActionSchema } from "./register.schema";

export async function registerAction(input: RegisterActionInput) {
  const { username, password } = registerActionSchema.parse(input);
  const passwordHash = await hashPassword(password);
  return await users.register({ username, passwordHash });
}

export async function createRootUserAction(input: RegisterActionInput) {
  const { username, password } = registerActionSchema.parse(input);
  const passwordHash = await hashPassword(password);
  return await users.createRootUser({ username, passwordHash });
}
