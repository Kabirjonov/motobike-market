import { describe, expect, it } from "vitest";

import {
  breadcrumbJsonLd,
  localeAlternates,
  localizedMetadata,
  productJsonLd,
} from "./seo";

describe("SEO contracts", () => {
  it("builds canonical and complete hreflang metadata", () => {
    const metadata = localizedMetadata({
      locale: "ru",
      path: "catalog",
      title: "Каталог",
      description: "Описание",
    });
    expect(metadata.alternates?.canonical).toContain("/ru/catalog");
    expect(metadata.alternates?.languages).toEqual(localeAlternates("catalog"));
  });

  it("creates Google Product/Offer without fake ratings", () => {
    const json = productJsonLd({
      name: "Honda",
      description: "Bike",
      sku: "H-1",
      images: ["https://example.com/a.webp"],
      brand: "Honda",
      price: "100.00",
      currency: "UZS",
      stock: 1,
      url: "https://example.com/uz/products/honda",
    });
    expect(json).toMatchObject({
      "@type": "Product",
      offers: {
        "@type": "Offer",
        priceCurrency: "UZS",
        availability: "https://schema.org/InStock",
      },
    });
    expect(json).not.toHaveProperty("aggregateRating");
  });

  it("numbers breadcrumb positions from one", () => {
    expect(
      breadcrumbJsonLd([{ name: "Home", url: "https://example.com" }])
        .itemListElement[0],
    ).toMatchObject({ "@type": "ListItem", position: 1 });
  });
});
