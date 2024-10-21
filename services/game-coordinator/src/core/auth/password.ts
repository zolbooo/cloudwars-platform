import argon2 from "argon2";

import { getAuthSecret } from "@/core/crypto/keys";

async function derivePasswordSecret(authSecret?: CryptoKey): Promise<Buffer> {
  if (!authSecret) {
    authSecret = await getAuthSecret();
  }
  const encoder = new TextEncoder();
  const pepper = await crypto.subtle.deriveBits(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: encoder.encode("password-pepper"),
      info: encoder.encode("Cloudwars password verification secret"),
    },
    authSecret,
    256
  );
  return Buffer.from(pepper);
}

export async function hashPassword(
  password: string,
  options?: { authSecret: CryptoKey }
): Promise<string> {
  const pepper = await derivePasswordSecret(options?.authSecret);
  return argon2.hash(password, { secret: pepper });
}

export function shouldRehashPassword(hash: string): boolean {
  return argon2.needsRehash(hash);
}

export async function verifyPassword(
  {
    hash,
    password,
  }: {
    hash: string;
    password: string;
  },
  options?: { authSecret: CryptoKey }
): Promise<boolean> {
  const pepper = await derivePasswordSecret(options?.authSecret);
  return argon2.verify(hash, password, { secret: pepper });
}
