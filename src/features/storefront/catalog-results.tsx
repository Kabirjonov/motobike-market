import Link from "next/link";

import { Reveal } from "@/components/motion/reveal";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { StorefrontCatalogQuery } from "@/schemas/storefront-catalog";
import type { StorefrontProductCard } from "@/server/repositories/storefront-catalog";

import { ProductCard } from "./product-card";

export function CatalogResults({
  items,
  page,
  pageCount,
  query,
  total,
}: {
  items: StorefrontProductCard[];
  page: number;
  pageCount: number;
  query: StorefrontCatalogQuery;
  total: number;
}) {
  function pageHref(value: number) {
    const params = new URLSearchParams();
    for (const [key, entry] of Object.entries(query))
      if (entry !== undefined && key !== "page") params.set(key, String(entry));
    params.set("page", String(value));
    return `/catalog?${params}`;
  }
  return (
    <section className="grid gap-6">
      <div className="flex items-center justify-between">
        <p aria-live="polite" className="text-muted-foreground text-sm">
          <strong className="text-foreground">{total}</strong> ta mahsulot
        </p>
      </div>
      {items.length ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item, index) => (
            <Reveal delay={(index % 6) * 0.055} key={item.id}>
              <ProductCard product={item} />
            </Reveal>
          ))}
        </div>
      ) : (
        <div className="grid min-h-72 place-items-center rounded-2xl border border-dashed p-8 text-center">
          <div>
            <h2 className="text-xl font-black">Mahsulot topilmadi</h2>
            <p className="text-muted-foreground mt-2">
              Qidiruv yoki filterlarni o‘zgartirib ko‘ring.
            </p>
            <Link className={cn(buttonVariants(), "mt-5")} href="/catalog">
              Filterlarni tozalash
            </Link>
          </div>
        </div>
      )}
      <nav
        aria-label="Katalog sahifalari"
        className="flex items-center justify-between"
      >
        <Link
          aria-disabled={page <= 1}
          className={cn(
            buttonVariants({ variant: "outline" }),
            page <= 1 && "pointer-events-none opacity-50",
          )}
          href={pageHref(page - 1)}
        >
          Oldingi
        </Link>
        <span className="text-muted-foreground text-sm">
          {page} / {pageCount}
        </span>
        <Link
          aria-disabled={page >= pageCount}
          className={cn(
            buttonVariants({ variant: "outline" }),
            page >= pageCount && "pointer-events-none opacity-50",
          )}
          href={pageHref(page + 1)}
        >
          Keyingi
        </Link>
      </nav>
    </section>
  );
}
