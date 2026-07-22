import { describe, expect, it } from "vitest";

import { storefrontCatalogQuerySchema } from "@/schemas/storefront-catalog";
describe("storefront catalog query", () => {
  it("parses shareable filters", () =>
    expect(
      storefrontCatalogQuerySchema.parse({
        q: "Honda",
        type: "MOTORCYCLE",
        minPrice: "100",
        maxPrice: "500",
        page: "2",
        sort: "price-asc",
      }),
    ).toMatchObject({
      q: "Honda",
      type: "MOTORCYCLE",
      minPrice: 100,
      maxPrice: 500,
      page: 2,
    }));
  it("rejects inverted price ranges", () =>
    expect(
      storefrontCatalogQuerySchema.safeParse({
        minPrice: "500",
        maxPrice: "100",
      }).success,
    ).toBe(false));
  it("uses safe defaults", () =>
    expect(
      storefrontCatalogQuerySchema.parse({
        type: "unsafe",
        page: "-1",
        sort: "random",
      }),
    ).toMatchObject({ page: 1, sort: "newest" }));
});
