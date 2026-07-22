import { ProductCondition, ProductType } from "@/generated/prisma/enums";
import type { StorefrontCatalogQuery } from "@/schemas/storefront-catalog";

type Facets = Awaited<
  ReturnType<
    typeof import("@/server/repositories/storefront-catalog").getStorefrontFacets
  >
>;
const input =
  "border-input bg-background min-h-10 w-full rounded-lg border px-3 py-2 text-sm";
export function CatalogFilters({
  facets,
  query,
}: {
  facets: Facets;
  query: StorefrontCatalogQuery;
}) {
  const fields = (
    <>
      <label className="grid gap-1 text-sm font-bold">
        Qidiruv
        <input
          className={input}
          defaultValue={query.q}
          name="q"
          placeholder="Mahsulot, SKU yoki brend"
        />
      </label>
      <label className="grid gap-1 text-sm font-bold">
        Tur
        <select className={input} defaultValue={query.type ?? ""} name="type">
          <option value="">Barchasi</option>
          {Object.values(ProductType).map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm font-bold">
        Kategoriya
        <select
          className={input}
          defaultValue={query.category ?? ""}
          name="category"
        >
          <option value="">Barchasi</option>
          {facets.categories.map((item) => {
            const uz = item.translations.find((t) => t.locale === "UZ");
            return (
              <option key={item.id} value={uz?.slug}>
                {uz?.name}
              </option>
            );
          })}
        </select>
      </label>
      <label className="grid gap-1 text-sm font-bold">
        Brend
        <select className={input} defaultValue={query.brand ?? ""} name="brand">
          <option value="">Barchasi</option>
          {facets.brands.map((item) => (
            <option key={item.id} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm font-bold">
        Holati
        <select
          className={input}
          defaultValue={query.condition ?? ""}
          name="condition"
        >
          <option value="">Barchasi</option>
          {Object.values(ProductCondition).map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="grid gap-1 text-sm font-bold">
          Min narx
          <input
            className={input}
            defaultValue={query.minPrice}
            min="0"
            name="minPrice"
            type="number"
          />
        </label>
        <label className="grid gap-1 text-sm font-bold">
          Max narx
          <input
            className={input}
            defaultValue={query.maxPrice}
            min="0"
            name="maxPrice"
            type="number"
          />
        </label>
      </div>
      <label className="grid gap-1 text-sm font-bold">
        Saralash
        <select className={input} defaultValue={query.sort} name="sort">
          <option value="newest">Eng yangi</option>
          <option value="price-asc">Narx: arzon</option>
          <option value="price-desc">Narx: qimmat</option>
        </select>
      </label>
      <div className="flex gap-2">
        <button
          className="bg-primary text-primary-foreground min-h-10 flex-1 rounded-lg px-4 text-sm font-bold"
          type="submit"
        >
          Ko‘rsatish
        </button>
        <a
          className="hover:bg-accent rounded-lg px-3 py-2 text-sm font-bold"
          href="/catalog"
        >
          Tozalash
        </a>
      </div>
    </>
  );
  return (
    <>
      <aside className="bg-card sticky top-20 hidden rounded-2xl border p-4 lg:block">
        <form className="grid gap-4" method="get">
          {fields}
        </form>
      </aside>
      <details className="bg-card rounded-xl border p-4 lg:hidden">
        <summary className="cursor-pointer font-bold">
          Filter va saralash
        </summary>
        <form className="mt-4 grid gap-4" method="get">
          {fields}
        </form>
      </details>
    </>
  );
}
