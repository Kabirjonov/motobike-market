import { describe, expect, it } from "vitest";

import { adminLoginSchema, getSafeInternalRedirect } from "./auth";

describe("admin auth schemas", () => {
  it("normalizes email without a separate account lookup response", () => {
    expect(
      adminLoginSchema.parse({
        email: "ADMIN@Example.COM",
        password: "secret",
      }).email,
    ).toBe("admin@example.com");
  });

  it.each([
    "https://evil.example/admin",
    "//evil.example/admin",
    "/\\evil.example/admin",
    undefined,
  ])("rejects unsafe redirect value %s", (value) => {
    expect(getSafeInternalRedirect(value)).toBe("/admin");
  });

  it("allows internal paths with query parameters", () => {
    expect(getSafeInternalRedirect("/admin/orders?page=2")).toBe(
      "/admin/orders?page=2",
    );
  });
});
