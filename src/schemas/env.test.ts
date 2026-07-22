import { describe, expect, it } from "vitest";

import { databaseEnvSchema, publicEnvSchema, serverEnvSchema } from "./env";

describe("environment schemas", () => {
  it("uses a local public URL by default", () => {
    expect(publicEnvSchema.parse({}).NEXT_PUBLIC_APP_URL).toBe(
      "http://localhost:3000",
    );
  });

  it("rejects incomplete server configuration", () => {
    expect(() => serverEnvSchema.parse({})).toThrow();
  });

  it("validates database configuration independently from storage", () => {
    expect(
      databaseEnvSchema.parse({
        DATABASE_URL: "postgresql://user:pass@localhost:5432/shop",
      }).DATABASE_URL,
    ).toContain("postgresql://");
  });

  it("accepts a complete typed server configuration", () => {
    const result = serverEnvSchema.parse({
      AUTH_SECRET: "a-secure-auth-secret-that-is-long-enough",
      AUTH_URL: "http://localhost:3000",
      DATABASE_URL: "postgresql://user:pass@localhost:5432/shop",
      NEXT_SERVER_ACTIONS_ENCRYPTION_KEY:
        "a-base64-compatible-key-that-is-long-enough",
      STORAGE_ACCESS_KEY_ID: "access-key",
      STORAGE_BUCKET: "motobike-shop",
      STORAGE_ENDPOINT: "https://storage.example.com",
      STORAGE_REGION: "auto",
      STORAGE_SECRET_ACCESS_KEY: "secret-key",
    });

    expect(result.STORAGE_BUCKET).toBe("motobike-shop");
  });
});
