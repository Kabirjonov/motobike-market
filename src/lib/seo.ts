import type { Metadata } from "next";

import type { AppLocale } from "@/i18n/routing";
import { publicEnv } from "@/lib/env/public";

export function absoluteUrl(path: string) {
  return new URL(path, publicEnv.NEXT_PUBLIC_APP_URL).toString();
}

export function localizedMetadata(input: {
  locale: AppLocale;
  path?: string;
  title: string;
  description: string;
  image?: { url: string; alt: string; width?: number; height?: number };
  noindex?: boolean;
}): Metadata {
  const path = input.path ? `/${input.path.replace(/^\//, "")}` : "";
  const url = absoluteUrl(path || "/");
  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: url },
    robots: input.noindex
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: input.locale,
      url,
      title: input.title,
      description: input.description,
      images: input.image ? [input.image] : undefined,
    },
    twitter: {
      card: input.image ? "summary_large_image" : "summary",
      title: input.title,
      description: input.description,
      images: input.image ? [input.image.url] : undefined,
    },
  };
}

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function productJsonLd(input: {
  name: string;
  description: string;
  sku: string;
  images: string[];
  brand?: string;
  price: string;
  currency: string;
  stock: number;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.name,
    description: input.description,
    sku: input.sku,
    image: input.images,
    ...(input.brand ? { brand: { "@type": "Brand", name: input.brand } } : {}),
    offers: {
      "@type": "Offer",
      price: input.price,
      priceCurrency: input.currency,
      availability:
        input.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: input.url,
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
