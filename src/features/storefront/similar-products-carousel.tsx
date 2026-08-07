"use client";

import { ChevronLeft, ChevronRight, Bike } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

import { formatStorefrontPrice } from "@/features/storefront/product-card";
import { type StorefrontProductCard } from "@/server/repositories/storefront-catalog";

type Props = {
  products: StorefrontProductCard[];
  locale: "UZ" | "RU" | "EN";
};

export function SimilarProductsCarousel({ products, locale }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (products.length === 0) return null;

  function scroll(direction: "left" | "right") {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const cardWidth = 320; // card size + gap
    const scrollAmount = direction === "left" ? -cardWidth : cardWidth;
    container.scrollBy({ left: scrollAmount, behavior: "smooth" });
  }

  return (
    <section className="mt-16">
      {/* Header with Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-zinc-900">O‘xshash mahsulotlar</h2>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => scroll("left")}
            className="grid size-8 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 shadow-sm transition-colors cursor-pointer"
            aria-label="Oldingi"
            type="button"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="grid size-8 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 shadow-sm transition-colors cursor-pointer"
            aria-label="Keyingi"
            type="button"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scroll-smooth no-scrollbar"
        style={{
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        }}
      >
        {products.map((product) => {
          const translation =
            product.translations.find((t) => t.locale === locale) ??
            product.translations.find((t) => t.locale === "UZ") ??
            product.translations[0];
          const image = product.images[0];
          const slug = translation?.slug ?? product.sku;

          return (
            <div
              key={product.id}
              className="w-[85vw] sm:w-[300px] shrink-0 snap-start"
            >
              <Link
                href={`/products/${slug}`}
                className="flex items-center gap-4 bg-white p-3 rounded-lg border border-zinc-200 shadow-sm hover:shadow-md transition duration-300 group"
              >
                {/* Image on the left */}
                <div className="relative size-20 sm:size-24 shrink-0 flex items-center justify-center bg-[#fdfdfd] overflow-hidden rounded-md border border-zinc-50">
                  {image ? (
                    <Image
                      alt={
                        (locale === "RU"
                          ? image.altRu
                          : locale === "EN"
                            ? image.altEn
                            : image.altUz) ?? image.altUz
                      }
                      className="h-full w-full object-contain p-1 transition duration-500 group-hover:scale-105"
                      height={image.height}
                      sizes="96px"
                      src={image.url}
                      width={image.width}
                    />
                  ) : (
                    <Bike className="text-zinc-300 size-10" />
                  )}
                </div>

                {/* Details on the right */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[13px] text-zinc-800 group-hover:text-[#e31e24] transition-colors line-clamp-2 leading-tight">
                    {translation?.name ?? product.sku}
                  </h3>
                  <p className="text-[#e31e24] mt-2 font-black text-sm">
                    {formatStorefrontPrice(product.price.toString(), product.currency, locale)}
                  </p>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {/* Hide scrollbar stylesheet */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
