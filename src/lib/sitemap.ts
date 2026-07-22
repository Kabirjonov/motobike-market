import type { MetadataRoute } from "next";

import { absoluteUrl, localeAlternates, locales } from "./seo";

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

const code = (locale: string) => locale.toLowerCase();
function translatedLanguages(items: Translation[], segment: string) {
  const languages: Record<string, string> = Object.fromEntries(
    items.map((item) => [
      code(item.locale),
      absoluteUrl(`/${code(item.locale)}/${segment}/${item.slug}`),
    ]),
  );
  if (languages.uz) languages["x-default"] = languages.uz;
  return languages;
}

export function buildSitemap(
  data: SitemapData,
  now = new Date(),
): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = locales.flatMap((locale) => [
    {
      url: absoluteUrl(`/${locale}`),
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
      alternates: { languages: localeAlternates() },
    },
    {
      url: absoluteUrl(`/${locale}/catalog`),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
      alternates: { languages: localeAlternates("catalog") },
    },
  ]);
  const products = data.products.flatMap((product) =>
    product.translations.map((item) => ({
      url: absoluteUrl(`/${code(item.locale)}/products/${item.slug}`),
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      images: product.images.map(({ url }) => url),
      alternates: {
        languages: translatedLanguages(product.translations, "products"),
      },
    })),
  );
  const categories = data.categories.flatMap((category) =>
    category.translations.map((item) => ({
      url: absoluteUrl(`/${code(item.locale)}/categories/${item.slug}`),
      lastModified: category.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
      alternates: {
        languages: translatedLanguages(category.translations, "categories"),
      },
    })),
  );
  const brands = data.brands.flatMap((brand) =>
    locales.map((locale) => ({
      url: absoluteUrl(`/${locale}/brands/${brand.slug}`),
      lastModified: brand.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
      alternates: { languages: localeAlternates(`brands/${brand.slug}`) },
    })),
  );
  return [...staticEntries, ...products, ...categories, ...brands];
}
