import {
  ArrowRight,
  Headphones,
  PackageCheck,
  ShieldCheck,
  Truck,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { getLocale } from "next-intl/server";

import { buttonVariants } from "@/components/ui/button";
import { ProductCard } from "@/features/storefront/product-card";
import { absoluteUrl, localizedMetadata, serializeJsonLd } from "@/lib/seo";
import { getHomeCatalog } from "@/server/repositories/storefront-catalog";

const homeSeo = {
  uz: {
    title: "Mototsikllar va ehtiyot qismlar",
    description:
      "Mototsikllar, ehtiyot qismlar, aksessuarlar va himoya jihozlarini Motobike Market’dan toping.",
  },
  ru: {
    title: "Мотоциклы и запчасти",
    description:
      "Мотоциклы, запчасти, аксессуары и экипировка в Motobike Market.",
  },
  en: {
    title: "Motorcycles and parts",
    description:
      "Find motorcycles, parts, accessories and riding gear at Motobike Market.",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as keyof typeof homeSeo;
  return localizedMetadata({ locale, ...homeSeo[locale] });
}

const benefits = [
  {
    icon: ShieldCheck,
    title: "Tekshirilgan katalog",
    text: "Narx va stock serverda nazorat qilinadi.",
  },
  {
    icon: Truck,
    title: "Yetkazib berish",
    text: "Buyurtma manzilini checkout’da kiriting.",
  },
  {
    icon: Headphones,
    title: "Admin kuzatuvi",
    text: "Har bir buyurtma admin panelda nazoratda.",
  },
  {
    icon: PackageCheck,
    title: "Guest checkout",
    text: "Akkaunt ochmasdan buyurtma bering.",
  },
];
export default async function HomePage() {
  await connection();
  const { categories, featured } = await getHomeCatalog();
  const locale = (await getLocale()) as "uz" | "ru" | "en";
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Motobike Market",
    url: absoluteUrl(`/${locale}`),
  };
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Motobike Market",
    url: absoluteUrl(`/${locale}`),
    inLanguage: locale,
    potentialAction: {
      "@type": "SearchAction",
      target: `${absoluteUrl(`/${locale}/catalog`)}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd([organization, website]),
        }}
        type="application/ld+json"
      />
      <section className="border-border relative overflow-hidden border-b">
        <div className="bg-primary/10 absolute inset-0 -z-10 [background-image:radial-gradient(circle_at_80%_10%,var(--primary),transparent_32%)] opacity-25" />
        <div className="container grid min-h-[72svh] items-center gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-primary text-sm font-black tracking-[.2em] uppercase">
              Motobike Market
            </p>
            <h1 className="mt-5 max-w-3xl text-5xl leading-none font-black tracking-[-.045em] text-balance sm:text-7xl">
              Yo‘l sizniki. Tanlov bizda.
            </h1>
            <p className="text-muted-foreground mt-6 max-w-2xl text-lg leading-8">
              Mototsikl, ehtiyot qism, aksessuar va himoya jihozlarini bir
              joydan toping.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                className={buttonVariants({ size: "lg" })}
                href={`/${locale}/catalog`}
              >
                Katalogni ko‘rish <ArrowRight className="size-4" />
              </Link>
              <Link
                className={buttonVariants({ size: "lg", variant: "outline" })}
                href={`/${locale}/catalog?type=MOTORCYCLE`}
              >
                Mototsikllar
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {categories.slice(0, 4).map((item, index) => {
              const uz = item.translations.find((t) => t.locale === "UZ");
              return (
                <Link
                  className="bg-card border-border hover:border-primary rounded-2xl border p-5 transition sm:p-7"
                  href={`/${locale}/categories/${item.translations.find((t) => t.locale === locale.toUpperCase())?.slug ?? uz?.slug}`}
                  key={item.id}
                >
                  <span className="text-primary text-xs font-black">
                    0{index + 1}
                  </span>
                  <h2 className="mt-10 text-xl font-black">{uz?.name}</h2>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {item._count.products} mahsulot
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
      <section className="container py-14 sm:py-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-primary text-sm font-black uppercase">
              Tanlangan
            </p>
            <h2 className="mt-2 text-3xl font-black">Featured mototsikllar</h2>
          </div>
          <Link
            className="font-bold hover:underline"
            href="/catalog?type=MOTORCYCLE"
          >
            Barchasi
          </Link>
        </div>
        {featured.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed p-10 text-center">
            <h3 className="font-black">Featured mahsulotlar tayyorlanmoqda</h3>
            <p className="text-muted-foreground mt-2 text-sm">
              Hozircha to‘liq katalogni ko‘ring.
            </p>
          </div>
        )}
      </section>
      <section className="bg-muted/60 border-y">
        <div className="container grid gap-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ icon: Icon, text, title }) => (
            <article
              className="bg-background rounded-xl border p-5"
              key={title}
            >
              <Icon className="text-primary size-6" />
              <h2 className="mt-5 font-black">{title}</h2>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                {text}
              </p>
            </article>
          ))}
        </div>
      </section>
      <section className="container py-16">
        <div className="bg-foreground text-background rounded-3xl p-8 sm:p-12">
          <h2 className="max-w-2xl text-3xl font-black sm:text-5xl">
            Kerakli mahsulotni bugun toping.
          </h2>
          <p className="mt-4 max-w-xl opacity-75">
            Filterlar bilan aniq tanlang va akkauntsiz buyurtma jarayoniga
            o‘ting.
          </p>
          <Link
            className="bg-primary text-primary-foreground mt-7 inline-flex rounded-lg px-5 py-3 font-bold"
            href="/catalog"
          >
            Katalogga o‘tish
          </Link>
        </div>
      </section>
    </>
  );
}
