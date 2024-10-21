"use server";
import { users } from "@/models/users";
import { setSession } from "@/core/auth/session";
import {
  hashPassword,
  verifyPassword,
  shouldRehashPassword,
} from "@/core/auth/password";

import { LoginActionInput, loginActionSchema } from "./login.schema";

export async function loginAction(input: LoginActionInput) {
  const { username, password } = loginActionSchema.parse(input);
  const user = await users.getByUsername(username);
  if (!user) {
    return { success: false, error: "user_not_found" } as const;
  }

  const isPasswordVerified = await verifyPassword({
    hash: user.passwordHash,
    password,
  });
  if (!isPasswordVerified) {
    return { success: false, error: "invalid_password" } as const;
  }

  if (shouldRehashPassword(user.passwordHash)) {
    const newHash = await hashPassword(password);
    await users.edit(user.id, { passwordHash: newHash });
  }
  await setSession({
    uid: user.id,
    username: user.username,
    role: user.role,
  });
  return { success: true } as const;
}
