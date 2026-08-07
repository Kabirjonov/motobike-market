import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getLocale } from "next-intl/server";

import { CatalogResults } from "@/features/storefront/catalog-results";
import { localizedMetadata } from "@/lib/seo";
import { storefrontCatalogQuerySchema } from "@/schemas/storefront-catalog";
import {
  findCategoryLanding,
  listStorefrontProducts,
} from "@/server/repositories/storefront-catalog";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await getLocale()) as "uz" | "ru" | "en";
  const category = await findCategoryLanding((await params).slug);
  if (!category) return { robots: { index: false, follow: false } };
  const requested =
    category.category.translations.find(
      (item) => item.locale === locale.toUpperCase(),
    ) ?? category.category.translations.find((item) => item.locale === "UZ")!;
  return localizedMetadata({
    locale,
    path: `categories/${requested.slug}`,
    title: requested.name,
    description: requested.description ?? `${requested.name} — Motobike Market`,
  });
}

export default async function CategoryLanding({ params, searchParams }: Props) {
  await connection();
  const { slug } = await params;
  const category = await findCategoryLanding(slug);
  if (!category) notFound();
  const query = storefrontCatalogQuerySchema.parse({
    ...(await searchParams),
    category: slug,
  });
  const results = await listStorefrontProducts(query);
  return (
    <div className="container py-12">
      <header className="mb-8 max-w-3xl">
        <p className="text-primary text-sm font-black uppercase">Kategoriya</p>
        <h1 className="mt-2 text-4xl font-black">{category.name}</h1>
        {category.description ? (
          <p className="text-muted-foreground mt-3 text-lg">
            {category.description}
          </p>
        ) : null}
      </header>
      <CatalogResults {...results} query={query} />
    </div>
  );
}
