import type { MetadataRoute } from "next";

import { absoluteUrl } from "./seo";

type Translation = { locale: string; slug: string };
type SitemapData = {
  products: {
    updatedAt: Date;
    translations: Translation[];
    images: { url: string }[];
  }[];
  categories: { updatedAt: Date; translations: Translation[] }[];
  brands: { slug: string; updatedAt: Date }[];
};

const uzTranslation = (items: Translation[]) =>
  items.find((item) => item.locale.toUpperCase() === "UZ");

export function buildSitemap(
  data: SitemapData,
  now = new Date(),
): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absoluteUrl("/catalog"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];
  const products = data.products.flatMap((product) => {
    const translation = uzTranslation(product.translations);
    return translation
      ? [
          {
            url: absoluteUrl(`/products/${translation.slug}`),
            lastModified: product.updatedAt,
            changeFrequency: "weekly" as const,
            priority: 0.8,
            images: product.images.map(({ url }) => url),
          },
        ]
      : [];
  });
  const categories = data.categories.flatMap((category) => {
    const translation = uzTranslation(category.translations);
    return translation
      ? [
          {
            url: absoluteUrl(`/categories/${translation.slug}`),
            lastModified: category.updatedAt,
            changeFrequency: "weekly" as const,
            priority: 0.7,
          },
        ]
      : [];
  });
  const brands = data.brands.map((brand) => ({
    url: absoluteUrl(`/brands/${brand.slug}`),
    lastModified: brand.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));
  return [...staticEntries, ...products, ...categories, ...brands];
}
