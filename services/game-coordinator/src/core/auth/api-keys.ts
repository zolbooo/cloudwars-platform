import assert from "assert/strict";
import { base64url } from "jose";

import { getAuthSecret } from "@/core/crypto/keys";

let apiKeySecret: CryptoKey | null = null;
async function getApiKeySecret(authSecret?: CryptoKey) {
  if (!authSecret) {
    authSecret = await getAuthSecret();
  }
  if (!apiKeySecret) {
    const encoder = new TextEncoder();
    apiKeySecret = await crypto.subtle.deriveKey(
      {
        name: "HKDF",
        hash: "SHA-256",
        salt: encoder.encode("api-key-secret"),
        info: encoder.encode("Cloudwars API key verification secret"),
      },
      authSecret,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"]
    );
  }
  return apiKeySecret;
}

/*
 * API key format: <version>:<uid>:<base64url(secret)>
 * Stored as: HMAC(api-key, api-key-secret), where API key secret is derived from the auth secret
 */

const CURRENT_API_KEY_VERSION = 1;
const MASKED_SECRET_LENGTH = 4;

function maskApiKey(apiKey: string) {
  const [version, uid, secret] = apiKey.split(":");
  assert(
    MASKED_SECRET_LENGTH < secret.length / 2,
    "Masked secret length is too long"
  );
  return `${version}:${uid}:${secret.substring(
    0,
    MASKED_SECRET_LENGTH
  )}${"*".repeat(secret.length - MASKED_SECRET_LENGTH)}`;
}
export async function generateApiKey(
  uid: string,
  options?: { authSecret: CryptoKey }
) {
  const secret = base64url.encode(crypto.getRandomValues(new Uint8Array(32)));
  const apiKey = `${CURRENT_API_KEY_VERSION}:${uid}:${secret}`;

  const signature = Buffer.from(
    await crypto.subtle.sign(
      "HMAC",
      await getApiKeySecret(options?.authSecret),
      new TextEncoder().encode(apiKey)
    )
  );
  return {
    apiKey,
    maskedApiKey: maskApiKey(apiKey),
    signature: base64url.encode(signature),
  };
}

export function decodeApiKey(apiKey: string) {
  const [versionString, uid, secret] = apiKey.split(":");
  const version = parseInt(versionString);
  if (Number.isNaN(version)) {
    throw new Error("Invalid API key version");
  }
  return { version, uid, secret };
}
export async function verifyApiKey(
  { apiKey, signature }: { apiKey: string; signature: string },
  options?: { authSecret: CryptoKey }
): Promise<{
  uid: string;
}> {
  const valid = await crypto.subtle.verify(
    "HMAC",
    await getApiKeySecret(options?.authSecret),
    Buffer.from(base64url.decode(signature)),
    new TextEncoder().encode(apiKey)
  );
  if (!valid) {
    throw new Error("Invalid API key");
  }

  const [version, uid] = apiKey.split(":");
  if (parseInt(version) !== CURRENT_API_KEY_VERSION) {
    throw new Error("Invalid API key version");
  }
  return { uid };
}
