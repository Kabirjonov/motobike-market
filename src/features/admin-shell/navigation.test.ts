import { describe, expect, it } from "vitest";

import { adminNavigation } from "./navigation";

describe("admin navigation", () => {
  it("contains every required admin section with message keys", () => {
    expect(adminNavigation.map(({ href }) => href)).toEqual([
      "/admin",
      "/admin/products",
      "/admin/categories",
      "/admin/brands",
      "/admin/orders",
      "/admin/settings",
    ]);

    expect(adminNavigation.every((item) => Boolean(item.key))).toBe(true);
  });
});
