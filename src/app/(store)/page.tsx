import {
  ArrowRight,
  BadgeCheck,
  Bike,
  ChevronRight,
  Headphones,
  Heart,
  PackageCheck,
  Send,
  ShieldCheck,
  ShoppingCart,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { getLocale } from "next-intl/server";

import { Reveal } from "@/components/motion/reveal";
import { HomeHeroCarousel } from "@/features/storefront/home-hero-carousel";
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
    description: "Мотоциклы, запчасти, аксессуары и экипировка.",
  },
  en: {
    title: "Motorcycles and parts",
    description: "Motorcycles, parts, accessories and riding gear.",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as keyof typeof homeSeo;
  return localizedMetadata({ locale, ...homeSeo[locale] });
}

const displayProducts = [
  ["LS2 FF353 Rapid", "Shox Helmet", "1 450 000 so‘m"],
  ["Alpinestars SP-8", "V3 Gloves", "950 000 so‘m"],
  ["Akrapovič GP", "Slip-On Exhaust", "8 750 000 so‘m"],
  ["DID VX3 530", "Chain & Sprocket Kit", "1 250 000 so‘m"],
  ["Dainese Laguna", "Seca Jacket", "2 950 000 so‘m"],
  ["Michelin Pilot Power", "2CT Tire", "1 650 000 so‘m"],
] as const;

const trustItems = [
  [ShieldCheck, "100% ishonchli to‘lov", "Xavfsiz va qulay"],
  [BadgeCheck, "Rasmiy brendlar", "Original mahsulotlar"],
  [Headphones, "Mijozlarni qo‘llab-quvvatlash", "Har kuni 09:00 – 22:00"],
  [PackageCheck, "UzExpertiza bilan hamkorlik", "Sifat nazorati kafolatlangan"],
] as const;

function Sprite({ index }: { index: number }) {
  return (
    <div
      aria-hidden="true"
      className="home-product-sprite"
      style={{ backgroundPosition: `${index * 20}% center` }}
    />
  );
}

export default async function HomePage() {
  await connection();
  const { categories, featured } = await getHomeCatalog();
  const locale = (await getLocale()) as "uz" | "ru" | "en";
  const localeEnum = locale.toUpperCase();
  const categoryFallbacks = [
    ["Mototsikllar", "Barcha mototsikllar"],
    ["Ehtiyot qismlar", "Barcha ehtiyot qismlar"],
    ["Aksessuarlar", "Barcha aksessuarlar"],
    ["Himoya jihozlari", "Barcha himoya jihozlari"],
  ];
  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Motobike Market",
      url: absoluteUrl(`/${locale}`),
    },
    {
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
    },
  ];

  return (
    <div className="bg-[#f7f7f6] text-[#111]">
      <script
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
        type="application/ld+json"
      />

      <HomeHeroCarousel locale={locale} />

      <div className="relative z-20 container -mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {categoryFallbacks.map(([fallbackName, subtitle], index) => {
          const category = categories[index];
          const translation = category?.translations.find(
            (item) => item.locale === localeEnum,
          );
          const uz = category?.translations.find(
            (item) => item.locale === "UZ",
          );
          return (
            <Reveal
              className="h-full"
              delay={index * 0.08}
              direction={index % 2 ? "left" : "right"}
              key={fallbackName}
            >
              <Link
                className="group relative flex h-28 overflow-hidden rounded-md border border-zinc-200 bg-white px-5 py-4 shadow-sm transition-shadow hover:shadow-lg"
                href={
                  category
                    ? `/${locale}/categories/${translation?.slug ?? uz?.slug}`
                    : `/${locale}/catalog`
                }
              >
                <div className="relative z-10 max-w-[55%]">
                  <h2 className="text-base font-extrabold">
                    {translation?.name ?? fallbackName}
                  </h2>
                  <p className="mt-2 flex items-center text-[11px] text-zinc-500">
                    {subtitle} <ChevronRight className="size-3" />
                  </p>
                </div>
                <div className="absolute -right-4 -bottom-7 h-28 w-36 transition duration-500 group-hover:scale-110 group-hover:-rotate-2">
                  <Sprite index={index === 0 ? 5 : Math.min(index + 2, 5)} />
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>

      <section className="container py-6">
        <Reveal>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-extrabold">Ommabop mahsulotlar</h2>
            <Link
              className="flex items-center gap-1 text-xs text-zinc-500 hover:text-red-600"
              href={`/${locale}/catalog`}
            >
              Barchasini ko‘rish <ArrowRight className="size-3" />
            </Link>
          </div>
        </Reveal>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {displayProducts.map(([name, subtitle, price], index) => {
            const dbProduct = featured[index];
            const dbTranslation = dbProduct?.translations.find(
              (item) => item.locale === localeEnum,
            );
            const href = dbProduct
              ? `/${locale}/products/${dbTranslation?.slug ?? dbProduct.sku}`
              : `/${locale}/catalog`;
            return (
              <Reveal className="h-full" delay={index * 0.055} key={name}>
                <article className="group relative h-full overflow-hidden rounded-md border border-zinc-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <button
                    aria-label={`${name} sevimlilarga qo‘shish`}
                    className="absolute top-2 right-2 z-10 text-zinc-600 transition hover:scale-125 hover:text-red-600"
                    type="button"
                  >
                    <Heart className="size-4" />
                  </button>
                  <Link className="block" href={href}>
                    <div className="h-32 p-2 transition duration-500 group-hover:scale-105">
                      <Sprite index={index} />
                    </div>
                    <div className="min-h-24 px-3 pb-3 text-xs">
                      <h3 className="font-medium">
                        {dbTranslation?.name ?? name}
                      </h3>
                      <p className="text-zinc-500">{subtitle}</p>
                      <strong className="mt-1 block text-[13px]">
                        {price}
                      </strong>
                    </div>
                  </Link>
                  <Link
                    aria-label={`${name} savatga qo‘shish`}
                    className="absolute right-3 bottom-3 grid size-8 place-items-center rounded border border-red-500 text-red-600 transition hover:scale-110 hover:bg-red-600 hover:text-white"
                    href={href}
                  >
                    <ShoppingCart className="size-4" />
                  </Link>
                </article>
              </Reveal>
            );
          })}
        </div>
        <div className="mt-3 flex justify-center gap-1.5">
          {[0, 1, 2, 3, 4, 5].map((dot) => (
            <span
              className={`size-1.5 rounded-full ${dot === 0 ? "bg-red-600" : "bg-zinc-200"}`}
              key={dot}
            />
          ))}
        </div>
      </section>

      <section className="container grid gap-4 pb-7 lg:grid-cols-[1.15fr_0.95fr]">
        <Reveal direction="right">
          <div className="grid h-full gap-5 rounded-md border border-zinc-200 bg-white px-6 py-7 sm:grid-cols-2 lg:grid-cols-4">
            {trustItems.map(([Icon, title, text], index) => (
              <div
                className="flex items-start gap-3 transition duration-300 hover:-translate-y-1"
                key={title}
                style={{ transitionDelay: `${index * 35}ms` }}
              >
                <Icon className="mt-0.5 size-7 shrink-0" strokeWidth={1.6} />
                <div>
                  <strong className="block text-[11px] leading-4">
                    {title}
                  </strong>
                  <p className="mt-1 text-[10px] text-zinc-500">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal direction="left">
          <div className="home-editorial group relative h-full overflow-hidden rounded-md px-7 py-5 text-white transition-shadow hover:shadow-2xl">
            <p className="text-[9px] font-bold tracking-wider text-red-500 uppercase">
              Editorial
            </p>
            <h2 className="mt-1 text-2xl font-black">Yo‘llar chaqiradi</h2>
            <p className="text-xs text-white/65">
              O‘zbekistonning eng go‘zal motomarshrutlari
            </p>
            <Link
              className="mt-3 inline-flex items-center gap-2 rounded border border-white/60 px-3 py-1 text-[10px] transition hover:bg-white hover:text-black"
              href={`/${locale}/catalog`}
            >
              Maqolani o‘qish <ArrowRight className="size-3" />
            </Link>
            <Bike className="absolute right-12 bottom-5 size-20 text-red-600/70 transition duration-500 group-hover:-translate-x-3" />
            <Send className="absolute right-6 bottom-5 size-5 text-white/30 transition group-hover:translate-x-2 group-hover:-translate-y-2" />
          </div>
        </Reveal>
      </section>
    </div>
  );
}
