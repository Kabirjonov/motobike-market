import { describe, expect, it } from "vitest";

import { buildSitemap } from "./sitemap";

describe("dynamic sitemap", () => {
  it("indexes the default Uzbek record without locale-prefixed duplicates", () => {
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
      item.url.endsWith("/products/honda"),
    );
    expect(product).toMatchObject({
      lastModified: updatedAt,
      images: ["https://cdn.example.com/honda.webp"],
    });
    expect(entries.some((item) => item.url.includes("/ru/"))).toBe(false);
  });
});
