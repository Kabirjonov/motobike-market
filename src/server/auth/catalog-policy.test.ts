import { describe, expect, it } from "vitest";

import { AdminRole } from "@/generated/prisma/enums";
import type { AuthorizedAdmin } from "@/server/auth/authorization-policy";
import { canManageCatalog } from "@/server/auth/catalog-policy";
function admin(role: AdminRole): AuthorizedAdmin {
  return { email: "admin@example.com", id: "admin-1", name: "Admin", role };
}
describe("catalog authorization integration", () => {
  it.each([AdminRole.SUPER_ADMIN, AdminRole.CATALOG_MANAGER])(
    "allows %s catalog mutations",
    (role) => expect(canManageCatalog(admin(role))).toBe(true),
  );
  it("rejects order managers and anonymous callers", () => {
    expect(canManageCatalog(admin(AdminRole.ORDER_MANAGER))).toBe(false);
    expect(canManageCatalog(null)).toBe(false);
  });
});
