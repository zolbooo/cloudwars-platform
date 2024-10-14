import { jwtDecrypt } from "jose";

import { getTokenSigningKey } from "./key";
import { TokenClaims, tokenClaimsSchema } from "./schema";

export async function verifyAuthToken(token: string, signingKey?: CryptoKey) {
  if (!signingKey) {
    signingKey = await getTokenSigningKey();
  }
  try {
    const { payload } = await jwtDecrypt<TokenClaims>(token, signingKey);
    return tokenClaimsSchema.parse(payload);
  } catch {
    return null;
  }
}
