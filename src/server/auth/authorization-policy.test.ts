import type { Session } from "next-auth";
import { describe, expect, it, vi } from "vitest";

import { AdminRole } from "@/generated/prisma/enums";

import { resolveAuthorizedAdmin } from "./authorization-policy";

const now = new Date("2026-07-22T10:00:00.000Z");

function createSession(expires = "2026-07-22T18:00:00.000Z"): Session {
  return {
    expires,
    user: {
      email: "admin@example.com",
      id: "admin-1",
      name: "Admin",
      role: AdminRole.SUPER_ADMIN,
    },
  };
}

describe("admin authorization policy", () => {
  it("rejects an unauthenticated protected request without a DB lookup", async () => {
    const lookup = vi.fn();

    expect(await resolveAuthorizedAdmin(null, lookup, now)).toBeNull();
    expect(lookup).not.toHaveBeenCalled();
  });

  it("rejects an expired session without a DB lookup", async () => {
    const lookup = vi.fn();

    expect(
      await resolveAuthorizedAdmin(
        createSession("2026-07-22T09:59:59.000Z"),
        lookup,
        now,
      ),
    ).toBeNull();
    expect(lookup).not.toHaveBeenCalled();
  });

  it("rejects a disabled admin", async () => {
    const lookup = vi.fn().mockResolvedValue({
      deletedAt: null,
      email: "admin@example.com",
      id: "admin-1",
      isActive: false,
      name: "Admin",
      role: AdminRole.SUPER_ADMIN,
    });

    expect(
      await resolveAuthorizedAdmin(createSession(), lookup, now),
    ).toBeNull();
  });

  it("authorizes an active admin and returns a minimal safe identity", async () => {
    const lookup = vi.fn().mockResolvedValue({
      deletedAt: null,
      email: "admin@example.com",
      id: "admin-1",
      isActive: true,
      name: "Admin",
      passwordHash: "must-not-leak",
      role: AdminRole.SUPER_ADMIN,
    });

    await expect(
      resolveAuthorizedAdmin(createSession(), lookup, now),
    ).resolves.toEqual({
      email: "admin@example.com",
      id: "admin-1",
      name: "Admin",
      role: AdminRole.SUPER_ADMIN,
    });
  });
});
