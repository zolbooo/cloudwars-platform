import { describe, expect, it } from "vitest";

import { signAuthToken } from "./sign";
import { verifyAuthToken } from "./verify";

describe("JWE token signing and verification", () => {
  it("should sign and verify a token", async () => {
    const signingKey = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );

    const claims = {
      uid: 'test',
      username: "test",
      role: "user",
    } as const;
    const token = await signAuthToken(claims, signingKey);
    expect(token).toBeDefined();

    const verifiedClaims = await verifyAuthToken(token, signingKey);
    expect(verifiedClaims).toEqual(claims);
  });
});
