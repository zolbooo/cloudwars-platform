import { webcrypto as crypto } from "crypto";

import { getAuthSecret } from "@/core/crypto/keys";

let tokenSigningKey: CryptoKey | null = null;

export async function getTokenSigningKey(authSecret?: CryptoKey) {
  if (tokenSigningKey) {
    return tokenSigningKey;
  }

  const textEncoder = new TextEncoder();
  tokenSigningKey = await crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: textEncoder.encode("auth-token"),
      info: textEncoder.encode("Cloudwars Auth token signing key"),
    },
    authSecret ?? (await getAuthSecret()),
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
  return tokenSigningKey;
}
