import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "./password";

describe("Password hashing", async () => {
  const authSecret = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode("secret-1"),
    "HKDF",
    false,
    ["deriveBits"]
  );

  it("should hash password properly", async () => {
    const hash = await hashPassword("Hello-world!2@", { authSecret });
    expect(typeof hash).toBe("string");
  });

  it("should verify password properly", async () => {
    const hash = await hashPassword("Hello-world!2@", { authSecret });
    await expect(
      verifyPassword({ hash, password: "Hello-world!2@" }, { authSecret })
    ).resolves.toBe(true);
  });

  it("should not verify wrong password", async () => {
    const hash = await hashPassword("Hello-world!2@", {
      authSecret: authSecret,
    });
    await expect(
      verifyPassword({ hash, password: "Hello-world" }, { authSecret })
    ).resolves.toBe(false);
  });

  it("should not verify password with wrong auth secret", async () => {
    const hash = await hashPassword("Hello-world!2@", { authSecret });
    const invalidAuthSecret = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode("secret-2"),
      "HKDF",
      false,
      ["deriveBits"]
    );
    await expect(
      verifyPassword(
        { hash, password: "Hello-world!2@" },
        { authSecret: invalidAuthSecret }
      )
    ).resolves.toBe(false);
  });
});
