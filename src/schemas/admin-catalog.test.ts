import { describe, expect, it } from "vitest";

import {
  productFromFormData,
  productInputSchema,
  productListQuerySchema,
} from "@/schemas/admin-catalog";
function demoForm(type = "PART") {
  const form = new FormData();
  Object.entries({
    sku: "demo-part-01",
    type,
    status: "ACTIVE",
    condition: "NEW",
    categoryId: "cat-1",
    brandId: "brand-1",
    price: "450000.00",
    compareAtPrice: "500000.00",
    stock: "8",
    "part.partNumber": "BP-001",
    compatibilities: "Honda | CB500X | 2019 | 2024 | 500 | Old tormoz",
  }).forEach(([key, value]) => form.set(key, value));
  form.set("isFeatured", "on");
  for (const locale of ["UZ", "RU", "EN"]) {
    form.set(`${locale}.name`, `Demo ${locale}`);
    form.set(`${locale}.slug`, `demo-${locale.toLowerCase()}`);
    form.set(`${locale}.description`, `Demo product description in ${locale}`);
    form.set(`${locale}.seoTitle`, `Demo ${locale}`);
    form.set(`${locale}.seoDescription`, `Demo metadata ${locale}`);
  }
  return form;
}
describe("admin catalog CRUD contract", () => {
  it("parses a complete demo part flow", () => {
    const result = productFromFormData(demoForm());
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sku).toBe("DEMO-PART-01");
      expect(result.data.compatibilities[0]).toMatchObject({
        make: "Honda",
        model: "CB500X",
        yearFrom: 2019,
      });
      expect(result.data.translations).toHaveLength(3);
    }
  });
  it("requires motorcycle data", () => {
    const input = productFromFormData(demoForm());
    expect(input.success).toBe(true);
    if (input.success)
      expect(
        productInputSchema.safeParse({
          ...input.data,
          type: "MOTORCYCLE",
          motorcycle: undefined,
        }).success,
      ).toBe(false);
  });
  it("rejects invalid compare-at price", () => {
    const form = demoForm();
    form.set("compareAtPrice", "100.00");
    expect(productFromFormData(form).success).toBe(false);
  });
  it("uses safe query defaults", () =>
    expect(
      productListQuerySchema.parse({ page: "-2", sort: "unsafe" }),
    ).toMatchObject({ page: 1, sort: "newest" }));
});
