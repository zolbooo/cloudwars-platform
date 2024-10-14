import "server-only";
import { cookies } from "next/headers";

import { TokenClaims } from "./token/schema";
import { signAuthToken } from "./token/sign";
import { verifyAuthToken } from "./token/verify";

const authSessionCookieName =
  process.env.NODE_ENV === "production" ? "__Host-auth" : "auth";

export async function setSession(data: TokenClaims) {
  const cookieStore = cookies();
  const token = await signAuthToken(data);
  cookieStore.set(authSessionCookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
}

export async function getSession(): Promise<TokenClaims | null> {
  const tokenCookie = cookies().get(authSessionCookieName);
  if (!tokenCookie) {
    return null;
  }
  return await verifyAuthToken(tokenCookie.value);
}
