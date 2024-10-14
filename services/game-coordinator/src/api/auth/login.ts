"use server";
import argon2 from "argon2";

import { users } from "@/models/users";
import { setSession } from "@/core/auth/session";

import { LoginActionInput, loginActionSchema } from "./login.schema";

export async function loginAction(input: LoginActionInput) {
  const { username, password } = loginActionSchema.parse(input);
  const user = await users.getByUsername(username);
  if (!user) {
    return { success: false, error: "user_not_found" } as const;
  }

  const isPasswordVerified = await argon2.verify(user.passwordHash, password);
  if (!isPasswordVerified) {
    return { success: false, error: "invalid_password" } as const;
  }

  if (argon2.needsRehash(user.passwordHash)) {
    const newHash = await argon2.hash(password);
    await users.edit(user.id, { passwordHash: newHash });
  }
  await setSession({
    uid: user.id,
    username: user.username,
    role: user.role,
  });
  return { success: true } as const;
}
