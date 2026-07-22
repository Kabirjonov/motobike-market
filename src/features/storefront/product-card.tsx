"use client";

import { Bike, PackageCheck, PackageX } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";

import type { StorefrontProductCard } from "@/server/repositories/storefront-catalog";

function translated<T extends { locale: string }>(values: T[], locale: string) {
  return (
    values.find((item) => item.locale === locale) ??
    values.find((item) => item.locale === "UZ") ??
    values[0]
  );
}
export function formatStorefrontPrice(
  value: string | number,
  currency: string,
  locale: "UZ" | "RU" | "EN",
) {
  const locales = { UZ: "uz-UZ", RU: "ru-RU", EN: "en-US" };
  return new Intl.NumberFormat(locales[locale], {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "UZS" ? 0 : 2,
  }).format(Number(value));
}

export function ProductCard({ product }: { product: StorefrontProductCard }) {
  const locale = useLocale().toUpperCase() as "UZ" | "RU" | "EN";
  const translation = translated(product.translations, locale);
  const image = product.images[0];
  return (
    <article className="bg-card border-border group overflow-hidden rounded-2xl border shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <Link
        className="focus-visible:ring-ring block rounded-2xl outline-none focus-visible:ring-2"
        href={`/${locale.toLowerCase()}/products/${translation?.slug ?? product.sku}`}
      >
        <div className="bg-muted relative aspect-[4/3] overflow-hidden">
          {image ? (
            <Image
              alt={
                (locale === "RU"
                  ? image.altRu
                  : locale === "EN"
                    ? image.altEn
                    : image.altUz) ?? image.altUz
              }
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              height={image.height}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              src={image.url}
              width={image.width}
            />
          ) : (
            <div className="grid h-full place-items-center">
              <Bike
                aria-hidden="true"
                className="text-muted-foreground size-12"
              />
            </div>
          )}
          <span className="bg-background/90 absolute top-3 left-3 rounded-full px-2.5 py-1 text-xs font-black">
            {product.type}
          </span>
        </div>
        <div className="grid gap-3 p-4">
          <div>
            <p className="text-muted-foreground text-xs font-bold uppercase">
              {product.brand?.name ?? product.type}
            </p>
            <h2 className="mt-1 line-clamp-2 text-lg font-black">
              {translation?.name ?? product.sku}
            </h2>
          </div>
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-primary text-lg font-black">
                {formatStorefrontPrice(
                  product.price.toString(),
                  product.currency,
                  locale,
                )}
              </p>
              {product.compareAtPrice ? (
                <p className="text-muted-foreground text-xs line-through">
                  {formatStorefrontPrice(
                    product.compareAtPrice.toString(),
                    product.currency,
                    locale,
                  )}
                </p>
              ) : null}
            </div>
            <span
              className={
                product.stock > 0
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-destructive"
              }
            >
              {product.stock > 0 ? (
                <PackageCheck aria-label="Mavjud" className="size-5" />
              ) : (
                <PackageX aria-label="Tugagan" className="size-5" />
              )}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
