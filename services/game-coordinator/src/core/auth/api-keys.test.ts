import { describe, expect, it } from "vitest";

import { decodeApiKey, generateApiKey, verifyApiKey } from "./api-keys";

describe("API keys", async () => {
  const authSecret = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode("auth-secret"),
    "HKDF",
    false,
    ["deriveBits", "deriveKey"]
  );

  it("generates API keys", async () => {
    const { apiKey } = await generateApiKey("uid", { authSecret });
    expect(apiKey.startsWith("1:uid:")).toBe(true);
  });

  it("masks API keys", async () => {
    const { apiKey, maskedApiKey } = await generateApiKey("uid", {
      authSecret,
    });
    const unmaskedSectionLength = "1:uid:".length + 4;
    expect(maskedApiKey).toBe(
      apiKey.substring(0, unmaskedSectionLength) +
        "*".repeat(apiKey.length - unmaskedSectionLength)
    );
  });

  it("decodes API keys", async () => {
    const { apiKey } = await generateApiKey("uid", { authSecret });
    const { version, uid } = decodeApiKey(apiKey);
    expect(version).toBe(1);
    expect(uid).toBe("uid");
  });

  it("verifies correct API keys", async () => {
    const { apiKey, signature } = await generateApiKey("uid", { authSecret });
    const { uid } = await verifyApiKey({ apiKey, signature }, { authSecret });
    expect(uid).toBe("uid");
  });

  it("rejects API keys with invalid signatures", async () => {
    const { apiKey } = await generateApiKey("uid", { authSecret });
    await expect(
      verifyApiKey({ apiKey, signature: "invalid" }, { authSecret })
    ).rejects.toThrow();
  });
});
