import { NextIntlClientProvider } from "next-intl";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  formatStorefrontPrice,
  ProductCard,
} from "@/features/storefront/product-card";
import { ProductGallery } from "@/features/storefront/product-gallery";
import { ProductLanguageLinks } from "@/features/storefront/product-language-links";
import { ProductType } from "@/generated/prisma/enums";
import messages from "@/messages/uz.json";
const product = {
  id: "p1",
  sku: "HON-01",
  type: ProductType.MOTORCYCLE,
  condition: null,
  price: "25000000.00",
  compareAtPrice: null,
  currency: "UZS",
  stock: 2,
  isFeatured: true,
  brand: { name: "Honda", slug: "honda" },
  category: {
    translations: [
      { locale: "UZ" as const, name: "Mototsikllar", slug: "mototsikllar" },
    ],
  },
  images: [
    {
      altEn: "Honda motorcycle",
      altRu: null,
      altUz: "Honda mototsikli",
      height: 800,
      url: "/demo/honda.webp",
      width: 1200,
    },
  ],
  translations: [
    { locale: "UZ" as const, name: "Honda CB500X", slug: "honda-cb500x" },
  ],
};
describe("public storefront UI", () => {
  it("renders product content, dimensions and link", () => {
    const html = renderToStaticMarkup(
      <NextIntlClientProvider
        locale="uz"
        messages={messages}
        timeZone="Asia/Tashkent"
      >
        <ProductCard product={product} />
      </NextIntlClientProvider>,
    );
    expect(html).toContain("Honda CB500X");
    expect(html).toContain("/uz/products/honda-cb500x");
    expect(html).toContain('width="1200"');
    expect(html).toContain("Honda mototsikli");
  });
  it("formats UZS locale-aware", () => {
    const value = formatStorefrontPrice("25000000.00", "UZS", "UZ");
    expect(value).toContain("25");
    expect(value).not.toContain(".00");
  });
  it("renders accessible gallery and locale product links", () => {
    const html = renderToStaticMarkup(
      <NextIntlClientProvider
        locale="uz"
        messages={messages}
        timeZone="Asia/Tashkent"
      >
        <ProductGallery
          images={[
            {
              alt: "Honda old tomoni",
              height: 800,
              id: "one",
              url: "/demo/honda.webp",
              width: 1200,
            },
          ]}
        />
        <ProductLanguageLinks
          preview={false}
          translations={[
            { locale: "UZ", slug: "honda" },
            { locale: "RU", slug: "honda-ru" },
          ]}
        />
      </NextIntlClientProvider>,
    );
    expect(html).toContain('aria-label="Mahsulot rasmlari"');
    expect(html).toContain("/ru/products/honda-ru");
    expect(html).toContain("Honda old tomoni");
  });
});
