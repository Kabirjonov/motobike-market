import { describe, expect, it } from "vitest";

import { buildSitemap } from "./sitemap";

describe("dynamic sitemap", () => {
  it("includes localized active DB records with alternates and lastModified", () => {
    const updatedAt = new Date("2026-07-22T00:00:00Z");
    const entries = buildSitemap(
      {
        products: [
          {
            updatedAt,
            images: [{ url: "https://cdn.example.com/honda.webp" }],
            translations: [
              { locale: "UZ", slug: "honda" },
              { locale: "RU", slug: "honda-ru" },
              { locale: "EN", slug: "honda-en" },
            ],
          },
        ],
        categories: [],
        brands: [],
      },
      updatedAt,
    );
    const product = entries.find((item) =>
      item.url.endsWith("/ru/products/honda-ru"),
    );
    expect(product).toMatchObject({
      lastModified: updatedAt,
      images: ["https://cdn.example.com/honda.webp"],
    });
    expect(product?.alternates?.languages).toHaveProperty("x-default");
  });
});
