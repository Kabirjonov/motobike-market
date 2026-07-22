import { describe, expect, it } from "vitest";

import {
  productDetailParamsSchema,
  productDetailQuerySchema,
} from "@/schemas/product-detail";
import { clampCartQuantity } from "@/stores/cart-store";
describe("product detail contracts", () => {
  it("accepts safe slugs and locale", () => {
    expect(productDetailParamsSchema.parse({ slug: "honda-cb500x" }).slug).toBe(
      "honda-cb500x",
    );
    expect(productDetailQuerySchema.parse({ lang: "ru" }).lang).toBe("ru");
  });
  it("rejects unsafe paths and invalid preview", () => {
    expect(
      productDetailParamsSchema.safeParse({ slug: "../admin" }).success,
    ).toBe(false);
    expect(
      productDetailQuerySchema.parse({ preview: "true" }).preview,
    ).toBeUndefined();
  });
  it("clamps cart quantity", () => {
    expect(clampCartQuantity(4, 2)).toBe(2);
    expect(clampCartQuantity(0, 5)).toBe(1);
  });
});
