import type { Metadata } from "next";
import { connection } from "next/server";
import { getLocale } from "next-intl/server";

import { CatalogFilters } from "@/features/storefront/catalog-filters";
import { CatalogResults } from "@/features/storefront/catalog-results";
import { localizedMetadata } from "@/lib/seo";
import { storefrontCatalogQuerySchema } from "@/schemas/storefront-catalog";
import {
  getStorefrontFacets,
  listStorefrontProducts,
} from "@/server/repositories/storefront-catalog";

const catalogSeo = {
  uz: {
    title: "Mototsikllar katalogi",
    description:
      "Mototsikllar, ehtiyot qismlar, aksessuarlar va ekipirovkalar katalogi.",
  },
  ru: {
    title: "Каталог мототоваров",
    description: "Каталог мотоциклов, запчастей, аксессуаров и экипировки.",
  },
  en: {
    title: "Motorcycle catalog",
    description: "Browse motorcycles, parts, accessories and riding gear.",
  },
} as const;
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, unknown>>;
}): Promise<Metadata> {
  const locale = (await getLocale()) as keyof typeof catalogSeo;
  const hasFacets = Object.keys(await searchParams).length > 0;
  return localizedMetadata({
    locale,
    path: "catalog",
    ...catalogSeo[locale],
    noindex: hasFacets,
  });
}
export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await connection();
  const raw = await searchParams;
  const values = Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  );
  const parsed = storefrontCatalogQuerySchema.safeParse(values);
  const query = parsed.success
    ? parsed.data
    : storefrontCatalogQuerySchema.parse({});
  const [results, facets] = await Promise.all([
    listStorefrontProducts(query),
    getStorefrontFacets(),
  ]);
  return (
    <div className="container py-10 sm:py-14">
      <header className="mb-8 max-w-3xl">
        <p className="text-primary text-sm font-black tracking-widest uppercase">
          Motobike Market
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
          Katalog
        </h1>
        <p className="text-muted-foreground mt-3 text-lg">
          Yo‘lingiz, mototsiklingiz va uslubingiz uchun kerakli mahsulotni
          toping.
        </p>
        {!parsed.success ? (
          <p className="text-destructive mt-3 text-sm" role="alert">
            Filter qiymatlari noto‘g‘ri edi va xavfsiz defaultlar qo‘llandi.
          </p>
        ) : null}
      </header>
      <div className="grid items-start gap-6 lg:grid-cols-[17rem_minmax(0,1fr)]">
        <CatalogFilters facets={facets} query={query} />
        <CatalogResults {...results} query={query} />
      </div>
    </div>
  );
}
