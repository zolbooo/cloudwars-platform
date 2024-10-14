import { EncryptJWT } from "jose";
import { webcrypto as crypto } from "crypto";

import { TokenClaims } from "./schema";
import { getTokenSigningKey } from "./key";

export async function signAuthToken(
  tokenClaims: TokenClaims,
  signingKey?: CryptoKey
) {
  if (!signingKey) {
    signingKey = await getTokenSigningKey();
  }
  return await new EncryptJWT(tokenClaims)
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setJti(crypto.randomUUID())
    .setExpirationTime("1d")
    .encrypt(signingKey);
}
