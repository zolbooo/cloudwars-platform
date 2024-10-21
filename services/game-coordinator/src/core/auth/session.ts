import "server-only";
import { cookies, headers } from "next/headers";

import { User, users } from "@/models/users";

import { TokenClaims } from "./token/schema";
import { signAuthToken } from "./token/sign";
import { verifyAuthToken } from "./token/verify";
import { decodeApiKey, verifyApiKey } from "./api-keys";

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

export async function getApiKeyUser(): Promise<User | null> {
  const authorizationHeader = headers().get("authorization");
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return null;
  }

  const apiKey = authorizationHeader.split(" ")[1];
  try {
    const decodedApiKey = decodeApiKey(apiKey);
    const user = await users.getById(decodedApiKey.uid);
    if (!user || !user.apiKeySignature) {
      return null;
    }
    const verifiedApiKey = await verifyApiKey({
      apiKey,
      signature: user.apiKeySignature,
    });
    if (verifiedApiKey.uid !== user.id) {
      return null;
    }
    return user;
  } catch {
    return null;
  }
}
