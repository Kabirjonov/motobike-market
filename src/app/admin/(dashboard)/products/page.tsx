import Link from "next/link";
import { connection } from "next/server";

import { Button, buttonVariants } from "@/components/ui/button";
import { archiveProductAction } from "@/features/admin-catalog/actions";
import { ProductStatus, ProductType } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";
import { productListQuerySchema } from "@/schemas/admin-catalog";
import {
  getCatalogOptions,
  listAdminProducts,
} from "@/server/repositories/admin-catalog-repository";

export const metadata = { title: "Mahsulotlar" };

type Search = Promise<Record<string, string | string[] | undefined>>;
function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  await connection();
  const raw = await searchParams;
  const query = productListQuerySchema.parse(
    Object.fromEntries(
      Object.entries(raw).map(([key, value]) => [key, single(value)]),
    ),
  );
  const [{ items, page, pageCount, total }, options] = await Promise.all([
    listAdminProducts(query),
    getCatalogOptions(),
  ]);
  const hrefForPage = (nextPage: number) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query))
      if (value && key !== "page") params.set(key, String(value));
    params.set("page", String(nextPage));
    return `/admin/products?${params}`;
  };
  return (
    <div className="grid gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-primary text-sm font-bold">Katalog</p>
          <h1 className="text-3xl font-black tracking-tight">Mahsulotlar</h1>
          <p className="text-muted-foreground mt-1">
            {total} ta mahsulot · stock 0 bo‘lsa “Out of stock”.
          </p>
        </div>
        <Link className={buttonVariants()} href="/admin/products/new">
          Yangi mahsulot
        </Link>
      </header>
      {raw.saved ? (
        <p
          className="border-primary/30 bg-primary/10 rounded-xl border p-3 text-sm font-semibold"
          role="status"
        >
          O‘zgarish muvaffaqiyatli saqlandi.
        </p>
      ) : null}
      <form className="bg-card border-border grid gap-3 rounded-2xl border p-4 md:grid-cols-3 xl:grid-cols-7">
        <label className="grid gap-1 text-sm font-semibold xl:col-span-2">
          Qidiruv
          <input
            className="border-input rounded-lg border px-3 py-2"
            defaultValue={query.q}
            name="q"
            placeholder="Nom, SKU, slug…"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Status
          <select
            className="border-input rounded-lg border px-3 py-2"
            defaultValue={query.status ?? ""}
            name="status"
          >
            <option value="">Barchasi</option>
            {Object.values(ProductStatus).map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Tur
          <select
            className="border-input rounded-lg border px-3 py-2"
            defaultValue={query.type ?? ""}
            name="type"
          >
            <option value="">Barchasi</option>
            {Object.values(ProductType).map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Kategoriya
          <select
            className="border-input rounded-lg border px-3 py-2"
            defaultValue={query.category ?? ""}
            name="category"
          >
            <option value="">Barchasi</option>
            {options.categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.translations[0]?.name ?? "—"}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Brend
          <select
            className="border-input rounded-lg border px-3 py-2"
            defaultValue={query.brand ?? ""}
            name="brand"
          >
            <option value="">Barchasi</option>
            {options.brands.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Saralash
          <select
            className="border-input rounded-lg border px-3 py-2"
            defaultValue={query.sort}
            name="sort"
          >
            <option value="newest">Yangi avval</option>
            <option value="oldest">Eski avval</option>
            <option value="price-asc">Narx ↑</option>
            <option value="price-desc">Narx ↓</option>
            <option value="stock-asc">Stock ↑</option>
            <option value="stock-desc">Stock ↓</option>
          </select>
        </label>
        <div className="flex items-end gap-2 xl:col-span-7">
          <Button type="submit">Filtrlash</Button>
          <Link
            className={buttonVariants({ variant: "ghost" })}
            href="/admin/products"
          >
            Tozalash
          </Link>
        </div>
      </form>
      <div className="bg-card border-border overflow-hidden rounded-2xl border shadow-sm">
        {items.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="p-4">Mahsulot</th>
                  <th className="p-4">Tur</th>
                  <th className="p-4">Narx</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Amal</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const out =
                    item.status === ProductStatus.ACTIVE && item.stock === 0;
                  return (
                    <tr className="border-t" key={item.id}>
                      <td className="p-4">
                        <Link
                          className="font-bold hover:underline"
                          href={`/admin/products/${item.id}`}
                        >
                          {item.translations.find((t) => t.locale === "UZ")
                            ?.name ?? item.sku}
                        </Link>
                        <span className="text-muted-foreground block text-xs">
                          {item.sku} · {item.category.translations[0]?.name}
                        </span>
                      </td>
                      <td className="p-4">{item.type}</td>
                      <td className="p-4 tabular-nums">
                        {Number(item.price).toLocaleString("uz-UZ")}{" "}
                        {item.currency}
                      </td>
                      <td className="p-4 tabular-nums">{item.stock}</td>
                      <td className="p-4">
                        <span
                          className={cn(
                            "rounded-full px-2 py-1 text-xs font-bold",
                            out
                              ? "bg-destructive/10 text-destructive"
                              : "bg-muted",
                          )}
                        >
                          {out ? "OUT OF STOCK" : item.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            className={buttonVariants({
                              size: "sm",
                              variant: "outline",
                            })}
                            href={`/admin/products/${item.id}`}
                          >
                            Tahrirlash
                          </Link>
                          <form
                            action={archiveProductAction.bind(
                              null,
                              item.id,
                              item.status !== ProductStatus.ARCHIVED,
                            )}
                          >
                            <Button size="sm" type="submit" variant="ghost">
                              {item.status === ProductStatus.ARCHIVED
                                ? "Restore"
                                : "Archive"}
                            </Button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid place-items-center p-12 text-center">
            <h2 className="font-bold">Mahsulot topilmadi</h2>
            <p className="text-muted-foreground text-sm">
              Filtrlarni tozalang yoki yangi mahsulot yarating.
            </p>
          </div>
        )}
      </div>
      <nav aria-label="Sahifalar" className="flex items-center justify-between">
        <Link
          aria-disabled={page <= 1}
          className={cn(
            buttonVariants({ variant: "outline" }),
            page <= 1 && "pointer-events-none opacity-50",
          )}
          href={hrefForPage(page - 1)}
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
          href={hrefForPage(page + 1)}
        >
          Keyingi
        </Link>
      </nav>
    </div>
  );
}
