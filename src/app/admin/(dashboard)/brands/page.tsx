import { connection } from "next/server";

import { Button } from "@/components/ui/button";
import { archiveBrandAction } from "@/features/admin-catalog/actions";
import { BrandForm } from "@/features/admin-catalog/taxonomy-forms";
import { listAdminBrands } from "@/server/repositories/admin-catalog-repository";

export const metadata = { title: "Brendlar" };
export default async function AdminBrandsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  await connection();
  const brands = await listAdminBrands();
  return (
    <div className="grid gap-6">
      <header>
        <p className="text-primary text-sm font-bold">Katalog</p>
        <h1 className="text-3xl font-black">Brendlar</h1>
        <p className="text-muted-foreground">
          Ishlab chiqaruvchilar va ularning katalog aloqalari.
        </p>
      </header>
      {(await searchParams).saved ? (
        <p className="border-primary/30 bg-primary/10 rounded-xl border p-3 text-sm font-semibold">
          Brend saqlandi.
        </p>
      ) : null}
      <div className="grid items-start gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <section className="bg-card rounded-2xl border p-5">
          <h2 className="mb-4 text-lg font-bold">Yangi brend</h2>
          <BrandForm />
        </section>
        <section className="grid gap-3">
          {brands.length ? (
            brands.map((item) => (
              <details className="bg-card rounded-2xl border p-5" key={item.id}>
                <summary className="cursor-pointer font-bold">
                  {item.name}
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
                  <BrandForm value={item} />
                  <form
                    action={archiveBrandAction.bind(
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
              Brendlar yo‘q.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
