import { describe, expect, it } from "vitest";

import { getAuthSecret } from "@/core/crypto/keys";

import { getTokenSigningKey } from "./key";

describe("Token signing key derivation", () => {
  it("should import auth secret", async () => {
    await expect(getAuthSecret("test-auth-secret")).resolves.toBeInstanceOf(
      CryptoKey
    );
  });

  it("should derive a key from the auth secret", async () => {
    const ikm = crypto.getRandomValues(new Uint8Array(32));
    const authSecret = await crypto.subtle.importKey(
      "raw",
      ikm,
      "HKDF",
      false,
      ["deriveKey", "deriveBits"]
    );
    await expect(getTokenSigningKey(authSecret)).resolves.toBeInstanceOf(
      CryptoKey
    );
  });
});
