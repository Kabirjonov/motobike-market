import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { buttonVariants } from "@/components/ui/button";
import { ProductForm } from "@/features/admin-catalog/product-form";
import { MediaManager } from "@/features/admin-media/media-manager";
import {
  getAdminProduct,
  getCatalogOptions,
} from "@/server/repositories/admin-catalog-repository";

export const metadata = { title: "Mahsulotni tahrirlash" };
type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
};

async function EditProductContent({ params, searchParams }: Props) {
  await connection();
  const { id } = await params;
  const [product, options] = await Promise.all([
    getAdminProduct(id),
    getCatalogOptions(),
  ]);
  if (!product) notFound();
  const compatibility = product.compatibilities
    .map((item) =>
      [
        item.make,
        item.model,
        item.yearFrom ?? "",
        item.yearTo ?? "",
        item.engineCc ?? "",
        item.note ?? "",
      ].join(" | "),
    )
    .join("\n");
  return (
    <div className="grid gap-6">
      <header>
        <p className="text-primary text-sm font-bold">Mahsulotlar</p>
        <h1 className="text-3xl font-black">
          {product.translations.find((item) => item.locale === "UZ")?.name ??
            product.sku}
        </h1>
        <p className="text-muted-foreground">{product.sku}</p>
        {product.translations.find((item) => item.locale === "UZ") ? (
          <Link
            className={`${buttonVariants({ variant: "outline" })} mt-4`}
            href={`/products/${product.translations.find((item) => item.locale === "UZ")?.slug}?preview=1`}
          >
            Xavfsiz preview
          </Link>
        ) : null}
      </header>
      {(await searchParams).saved ? (
        <p
          className="border-primary/30 bg-primary/10 rounded-xl border p-3 text-sm font-semibold"
          role="status"
        >
          Mahsulot saqlandi.
        </p>
      ) : null}
      <ProductForm
        brands={options.brands.map(({ id, name }) => ({ id, name }))}
        categories={options.categories.map((item) => ({
          id: item.id,
          name: item.translations[0]?.name ?? "—",
        }))}
        value={{
          id: product.id,
          sku: product.sku,
          type: product.type,
          status: product.status,
          condition: product.condition,
          categoryId: product.categoryId,
          brandId: product.brandId,
          price: product.price.toString(),
          compareAtPrice: product.compareAtPrice?.toString(),
          stock: product.stock,
          isFeatured: product.isFeatured,
          motorcycle: product.motorcycleSpec,
          part: product.partSpec,
          compatibility,
          translations: product.translations.map((item) => ({
            description: item.description,
            locale: item.locale,
            name: item.name,
            seoDescription: item.seoDescription,
            seoTitle: item.seoTitle,
            slug: item.slug,
          })),
        }}
      />
      <MediaManager
        images={product.images.map((image) => ({
          altEn: image.altEn,
          altRu: image.altRu,
          altUz: image.altUz,
          height: image.height,
          id: image.id,
          isPrimary: image.isPrimary,
          url: image.url,
          width: image.width,
        }))}
        productId={product.id}
        productStatus={product.status}
      />
    </div>
  );
}

export default function EditProductPage(props: Props) {
  return (
    <Suspense
      fallback={<div className="bg-muted h-96 animate-pulse rounded-2xl" />}
    >
      <EditProductContent {...props} />
    </Suspense>
  );
}
