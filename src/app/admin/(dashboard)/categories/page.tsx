import { connection } from "next/server";

import { Button } from "@/components/ui/button";
import { archiveCategoryAction } from "@/features/admin-catalog/actions";
import { CategoryForm } from "@/features/admin-catalog/taxonomy-forms";
import { listAdminCategories } from "@/server/repositories/admin-catalog-repository";

export const metadata = { title: "Kategoriyalar" };
export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  await connection();
  const categories = await listAdminCategories();
  return (
    <div className="grid gap-6">
      <header>
        <p className="text-primary text-sm font-bold">Katalog</p>
        <h1 className="text-3xl font-black">Kategoriyalar</h1>
        <p className="text-muted-foreground">
          Uch tildagi nom, slug va SEO metadata.
        </p>
      </header>
      {(await searchParams).saved ? (
        <p className="border-primary/30 bg-primary/10 rounded-xl border p-3 text-sm font-semibold">
          Kategoriya saqlandi.
        </p>
      ) : null}
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(20rem,0.8fr)_minmax(0,1.2fr)]">
        <section className="bg-card rounded-2xl border p-5">
          <h2 className="mb-4 text-lg font-bold">Yangi kategoriya</h2>
          <CategoryForm />
        </section>
        <section className="grid gap-3">
          {categories.length ? (
            categories.map((item) => (
              <details className="bg-card rounded-2xl border p-5" key={item.id}>
                <summary className="cursor-pointer font-bold">
                  {item.translations.find((row) => row.locale === "UZ")?.name ??
                    "Nomsiz"}
                  <span className="text-muted-foreground ml-2 text-xs">
                    {item._count.products} mahsulot ·{" "}
                    {item.archivedAt
                      ? "ARCHIVED"
                      : item.isActive
                        ? "ACTIVE"
                        : "INACTIVE"}
                  </span>
                </summary>
                <div className="mt-5 grid gap-4">
                  <CategoryForm value={item} />
                  <form
                    action={archiveCategoryAction.bind(
                      null,
                      item.id,
                      !item.archivedAt,
                    )}
                  >
                    <Button type="submit" variant="outline">
                      {item.archivedAt ? "Restore" : "Archive"}
                    </Button>
                  </form>
                </div>
              </details>
            ))
          ) : (
            <p className="rounded-2xl border border-dashed p-8 text-center">
              Kategoriyalar yo‘q.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
