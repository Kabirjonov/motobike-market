"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

import { ProductCard } from "@/features/storefront/product-card";
import type { StorefrontProductCard } from "@/server/repositories/storefront-catalog";

type Props = {
  title: string;
  viewAllLink?: string;
  products: StorefrontProductCard[];
};

export function HomeProductCarousel({ title, viewAllLink, products }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (products.length === 0) return null;

  function scroll(direction: "left" | "right") {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const cardWidth = 240; // approx card width + gap
    const scrollAmount = direction === "left" ? -cardWidth * 2 : cardWidth * 2;
    container.scrollBy({ left: scrollAmount, behavior: "smooth" });
  }

  return (
    <section className="container py-8">
      {/* Header with Navigation */}
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-zinc-900">{title}</h2>
        <div className="flex items-center gap-3">
          {viewAllLink && (
            <Link
              className="text-xs font-semibold text-zinc-500 hover:text-red-600 transition-colors"
              href={viewAllLink}
            >
              Barchasini ko‘rish →
            </Link>
          )}
          <div className="flex items-center gap-1">
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
      </div>

      {/* Vertical Card Carousel Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scroll-smooth no-scrollbar"
        style={{
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        }}
      >
        {products.map((item) => (
          <div
            key={item.id}
            className="w-[60vw] sm:w-[220px] shrink-0 snap-start"
          >
            <ProductCard product={item} />
          </div>
        ))}
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
