import { describe, expect, it } from "vitest";

import { AdminRole } from "@/generated/prisma/enums";

import { canManageOrders } from "./order-policy";

const admin = (role: AdminRole) => ({
  email: "admin@example.com",
  id: "admin-1",
  name: "Admin",
  role,
});

describe("order authorization", () => {
  it("allows order managers and super admins", () => {
    expect(canManageOrders(admin(AdminRole.ORDER_MANAGER))).toBe(true);
    expect(canManageOrders(admin(AdminRole.SUPER_ADMIN))).toBe(true);
  });

  it("rejects catalog managers and anonymous users", () => {
    expect(canManageOrders(admin(AdminRole.CATALOG_MANAGER))).toBe(false);
    expect(canManageOrders(null)).toBe(false);
  });
});
