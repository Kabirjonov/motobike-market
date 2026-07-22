import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getLocale } from "next-intl/server";

import { CatalogResults } from "@/features/storefront/catalog-results";
import { localizedMetadata } from "@/lib/seo";
import { storefrontCatalogQuerySchema } from "@/schemas/storefront-catalog";
import {
  findBrandLanding,
  listStorefrontProducts,
} from "@/server/repositories/storefront-catalog";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
};
const brandDescription = {
  uz: "mototsikllari va mahsulotlari",
  ru: "мотоциклы и товары",
  en: "motorcycles and products",
} as const;
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await getLocale()) as keyof typeof brandDescription;
  const brand = await findBrandLanding((await params).slug);
  if (!brand) return { robots: { index: false, follow: false } };
  return localizedMetadata({
    locale,
    path: `brands/${brand.slug}`,
    title: brand.name,
    description: `${brand.name} ${brandDescription[locale]} — Motobike Market`,
  });
}

export default async function BrandLanding({ params, searchParams }: Props) {
  await connection();
  const { slug } = await params;
  const brand = await findBrandLanding(slug);
  if (!brand) notFound();
  const query = storefrontCatalogQuerySchema.parse({
    ...(await searchParams),
    brand: slug,
  });
  const results = await listStorefrontProducts(query);
  return (
    <div className="container py-12">
      <header className="mb-8 max-w-3xl">
        <p className="text-primary text-sm font-black uppercase">Brend</p>
        <h1 className="mt-2 text-4xl font-black">{brand.name}</h1>
        <p className="text-muted-foreground mt-3">
          {results.total} ta faol mahsulot.
        </p>
      </header>
      <CatalogResults {...results} query={query} />
    </div>
  );
}
