import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { connection } from "next/server";
import { getLocale, getTranslations } from "next-intl/server";

import { Reveal } from "@/components/motion/reveal";
import { ProductCard } from "@/features/storefront/product-card";
import { ProductGallery } from "@/features/storefront/product-gallery";
import { ProductLanguageLinks } from "@/features/storefront/product-language-links";
import { PurchasePanel } from "@/features/storefront/purchase-panel";
import { Locale, ProductStatus, ProductType } from "@/generated/prisma/enums";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  productJsonLd,
  serializeJsonLd,
} from "@/lib/seo";
import {
  productDetailParamsSchema,
  productDetailQuerySchema,
} from "@/schemas/product-detail";
import { getCurrentAdmin } from "@/server/auth/authorization";
import { findActiveRedirect } from "@/server/repositories/redirect-repository";
import {
  getAdminPreviewProductDetail,
  getPublicProductDetail,
} from "@/server/repositories/storefront-product-detail";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string; preview?: string }>;
};
async function load(props: Props) {
  const params = productDetailParamsSchema.safeParse(await props.params);
  const locale = await getLocale();
  const query = productDetailQuerySchema.parse({
    ...(await props.searchParams),
    lang: locale,
  });
  if (!params.success) return null;
  if (query.preview) {
    if (!(await getCurrentAdmin())) return null;
    const result = await getAdminPreviewProductDetail(
      params.data.slug,
      query.lang,
    );
    return result ? { ...result, preview: true } : null;
  }
  const result = await getPublicProductDetail(params.data.slug, query.lang);
  if (result) return { ...result, preview: false };
  const oldPath = `/${query.lang}/products/${params.data.slug}`;
  const legacy = await findActiveRedirect(oldPath);
  if (legacy) {
    if (legacy.statusCode === "TEMPORARY_REDIRECT")
      redirect(legacy.destinationPath);
    permanentRedirect(legacy.destinationPath);
  }
  return null;
}
function selected<T extends { locale: Locale }>(
  translations: T[],
  locale: Locale,
) {
  return (
    translations.find((item) => item.locale === locale) ??
    translations.find((item) => item.locale === Locale.UZ) ??
    translations[0]
  );
}
function languageUrls(translations: { locale: Locale; slug: string }[]) {
  const languages = Object.fromEntries(
    translations.map((item) => {
      const lang = item.locale.toLowerCase();
      return [lang, `/${lang}/products/${item.slug}`];
    }),
  );
  const uz = translations.find((item) => item.locale === Locale.UZ);
  if (uz) languages["x-default"] = `/uz/products/${uz.slug}`;
  return languages;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const data = await load(props);
  if (!data)
    return {
      title: (await getTranslations("metadata"))("notFound"),
      robots: { index: false, follow: false },
    };
  const translation = selected(data.product.translations, data.requestedLocale);
  const canonical = `/${data.requestedLocale.toLowerCase()}/products/${translation?.slug}`;
  return {
    title: translation?.seoTitle || translation?.name,
    description:
      translation?.seoDescription || translation?.description.slice(0, 160),
    alternates: {
      canonical,
      languages: languageUrls(data.product.translations),
    },
    robots:
      data.preview || data.product.status !== ProductStatus.ACTIVE
        ? { index: false, follow: false }
        : { index: true, follow: true },
    openGraph: {
      type: "website",
      title: translation?.name,
      description:
        translation?.seoDescription || translation?.description.slice(0, 160),
      images: data.product.images[0]
        ? [
            {
              url: data.product.images[0].url,
              width: data.product.images[0].width,
              height: data.product.images[0].height,
              alt: data.product.images[0].altUz,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: translation?.name,
      description:
        translation?.seoDescription || translation?.description.slice(0, 160),
      images: data.product.images[0] ? [data.product.images[0].url] : [],
    },
  };
}

export default async function ProductDetailPage(props: Props) {
  await connection();
  const data = await load(props);
  if (!data) notFound();
  const { product } = data;
  const translation = selected(product.translations, data.requestedLocale);
  const category = selected(
    product.category.translations,
    data.requestedLocale,
  );
  if (!translation) notFound();
  const localeCode =
    data.requestedLocale === Locale.RU
      ? "ru-RU"
      : data.requestedLocale === Locale.EN
        ? "en-US"
        : "uz-UZ";
  const price = new Intl.NumberFormat(localeCode, {
    style: "currency",
    currency: product.currency,
    maximumFractionDigits: product.currency === "UZS" ? 0 : 2,
  }).format(Number(product.price));
  const images = product.images.map((image) => ({
    id: image.id,
    url: image.url,
    width: image.width,
    height: image.height,
    alt:
      (data.requestedLocale === Locale.RU
        ? image.altRu
        : data.requestedLocale === Locale.EN
          ? image.altEn
          : image.altUz) ?? image.altUz,
  }));
  const canonicalUrl = `/${data.requestedLocale.toLowerCase()}/products/${translation.slug}`;
  const jsonLd = productJsonLd({
    name: translation.name,
    description: translation.description,
    sku: product.sku,
    images: product.images.map(({ url }) => url),
    brand: product.brand?.name,
    price: product.price,
    currency: product.currency,
    stock: product.stock,
    url: absoluteUrl(canonicalUrl),
  });
  const categorySlug = category?.slug;
  const breadcrumbLd = breadcrumbJsonLd([
    {
      name: "Motobike Market",
      url: absoluteUrl(`/${data.requestedLocale.toLowerCase()}`),
    },
    {
      name: "Catalog",
      url: absoluteUrl(`/${data.requestedLocale.toLowerCase()}/catalog`),
    },
    ...(category && categorySlug
      ? [
          {
            name: category.name,
            url: absoluteUrl(
              `/${data.requestedLocale.toLowerCase()}/categories/${categorySlug}`,
            ),
          },
        ]
      : []),
    { name: translation.name, url: absoluteUrl(canonicalUrl) },
  ]);
  return (
    <div className="container pt-6 pb-28 lg:pb-16">
      <script
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(jsonLd),
        }}
        type="application/ld+json"
      />
      <script
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbLd) }}
        type="application/ld+json"
      />
      {data.preview ? (
        <div
          className="border-primary bg-primary/10 mb-5 rounded-xl border p-3 text-sm font-bold"
          role="status"
        >
          Admin preview · {product.status} · public indekslash o‘chirilgan
        </div>
      ) : null}
      <nav
        aria-label="Breadcrumb"
        className="text-muted-foreground mb-6 flex flex-wrap gap-2 text-sm"
      >
        <Link href="/">Bosh sahifa</Link>
        <span>/</span>
        <Link href="/catalog">Katalog</Link>
        {category ? (
          <>
            <span>/</span>
            <Link
              href={`/categories/${selected(product.category.translations, Locale.UZ)?.slug}`}
            >
              {category.name}
            </Link>
          </>
        ) : null}
        <span>/</span>
        <span aria-current="page">{translation.name}</span>
      </nav>
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(22rem,.85fr)]">
        <Reveal direction="right">
          <ProductGallery images={images} />
        </Reveal>
        <Reveal direction="left">
          <section className="grid gap-6 lg:sticky lg:top-24">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-primary text-sm font-black uppercase">
                  {product.brand?.name ?? product.type}
                </p>
                <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                  {translation.name}
                </h1>
              </div>
              <ProductLanguageLinks
                preview={data.preview}
                translations={product.translations.map(({ locale, slug }) => ({
                  locale,
                  slug,
                }))}
              />
            </div>
            <div>
              <p className="text-3xl font-black">{price}</p>
              {product.compareAtPrice ? (
                <p className="text-muted-foreground line-through">
                  {new Intl.NumberFormat(localeCode, {
                    style: "currency",
                    currency: product.currency,
                    maximumFractionDigits: 0,
                  }).format(Number(product.compareAtPrice))}
                </p>
              ) : null}
            </div>
            <dl className="grid grid-cols-2 gap-3 rounded-xl border p-4 text-sm">
              <div>
                <dt className="text-muted-foreground">SKU</dt>
                <dd className="font-bold">{product.sku}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Mavjudlik</dt>
                <dd
                  className={
                    product.stock > 0
                      ? "font-bold text-emerald-700 dark:text-emerald-400"
                      : "text-destructive font-bold"
                  }
                >
                  {product.stock > 0
                    ? `${product.stock} dona mavjud`
                    : "Sotuvda yo‘q"}
                </dd>
              </div>
            </dl>
            <PurchasePanel
              imageUrl={product.images[0]?.url}
              name={translation.name}
              price={product.price}
              productId={product.id}
              sku={product.sku}
              stock={product.stock}
            />
          </section>
        </Reveal>
      </div>
      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_.8fr]">
        <Reveal direction="right">
          <article>
            <h2 className="text-2xl font-black">Tavsif</h2>
            <div className="text-muted-foreground mt-4 leading-8 whitespace-pre-line">
              {translation.description}
            </div>
          </article>
        </Reveal>
        <Reveal direction="left">
          <section>
            <h2 className="text-2xl font-black">Xususiyatlar</h2>
            <dl className="mt-4 divide-y rounded-xl border">
              {product.type === ProductType.MOTORCYCLE &&
              product.motorcycleSpec ? (
                Object.entries({
                  Marka: product.motorcycleSpec.make,
                  Model: product.motorcycleSpec.model,
                  Yil: product.motorcycleSpec.year,
                  "Dvigatel hajmi": `${product.motorcycleSpec.engineCc} cc`,
                  "Yurgan masofa": `${product.motorcycleSpec.mileageKm.toLocaleString(localeCode)} km`,
                  Holati: product.condition ?? "—",
                }).map(([label, value]) => (
                  <div className="flex justify-between gap-4 p-3" key={label}>
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="text-right font-bold">{value}</dd>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex justify-between p-3">
                    <dt className="text-muted-foreground">Part number</dt>
                    <dd className="font-bold">
                      {product.partSpec?.partNumber ?? "—"}
                    </dd>
                  </div>
                </>
              )}
            </dl>
          </section>
        </Reveal>
      </div>
      {product.type === ProductType.PART && product.compatibilities.length ? (
        <section className="mt-12">
          <h2 className="text-2xl font-black">Mos keladigan mototsikllar</h2>
          <div className="mt-4 overflow-x-auto rounded-xl border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="p-3">Marka</th>
                  <th className="p-3">Model</th>
                  <th className="p-3">Yillar</th>
                  <th className="p-3">Dvigatel</th>
                  <th className="p-3">Izoh</th>
                </tr>
              </thead>
              <tbody>
                {product.compatibilities.map((item) => (
                  <tr className="border-t" key={item.id}>
                    <td className="p-3 font-bold">{item.make}</td>
                    <td className="p-3">{item.model}</td>
                    <td className="p-3">
                      {item.yearFrom ?? "—"}–{item.yearTo ?? "—"}
                    </td>
                    <td className="p-3">
                      {item.engineCc ? `${item.engineCc} cc` : "—"}
                    </td>
                    <td className="p-3">{item.note ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
      {data.related.length ? (
        <Reveal className="mt-16">
          <section>
            <div className="mb-6 flex justify-between">
              <h2 className="text-2xl font-black">O‘xshash mahsulotlar</h2>
              <Link
                className="font-bold hover:underline"
                href={`/catalog?category=${selected(product.category.translations, Locale.UZ)?.slug}`}
              >
                Barchasi
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {data.related.map((item, index) => (
                <Reveal delay={index * 0.07} key={item.id}>
                  <ProductCard product={item} />
                </Reveal>
              ))}
            </div>
          </section>
        </Reveal>
      ) : null}
    </div>
  );
}
