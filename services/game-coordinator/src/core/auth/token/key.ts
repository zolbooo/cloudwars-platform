import { webcrypto as crypto } from "crypto";

let tokenSigningKey: CryptoKey | null = null;

export async function getTokenSigningKey() {
  if (tokenSigningKey) {
    return tokenSigningKey;
  }

  const authSecret = process.env.AUTH_SECRET;
  if (!authSecret) {
    throw new Error(
      "AUTH_SECRET environment variable is not set. Is it provided in the Cloud Run service configuration?"
    );
  }

  const keyMaterial = Buffer.from(authSecret, "base64");
  if (keyMaterial.length !== 32) {
    throw new Error("AUTH_SECRET must be 32 byte, base64-encoded string");
  }
  tokenSigningKey = await crypto.subtle.importKey(
    "raw",
    keyMaterial,
    "AES-GCM",
    false,
    ["encrypt", "decrypt"]
  );
  return tokenSigningKey;
}
