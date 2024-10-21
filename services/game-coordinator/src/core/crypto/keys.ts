import { webcrypto as crypto } from "crypto";

let key: CryptoKey | null = null;
export async function getAuthSecret(authSecret?: string): Promise<CryptoKey> {
  if (!key) {
    if (!authSecret) {
      authSecret = process.env.AUTH_SECRET;
      if (!authSecret) {
        throw new Error(
          "AUTH_SECRET environment variable is not set. Is it provided in the Cloud Run service configuration?"
        );
      }
    }

    const keyMaterial = new TextEncoder().encode(authSecret);
    key = await crypto.subtle.importKey("raw", keyMaterial, "HKDF", false, [
      "deriveKey",
      "deriveBits",
    ]);
  }
  return key;
}
