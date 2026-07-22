import { connection } from "next/server";

import { ProductForm } from "@/features/admin-catalog/product-form";
import { Locale } from "@/generated/prisma/enums";
import { getCatalogOptions } from "@/server/repositories/admin-catalog-repository";

export const metadata = { title: "Yangi mahsulot" };
export default async function NewProductPage() {
  await connection();
  const { brands, categories } = await getCatalogOptions();
  return (
    <div className="grid gap-6">
      <header>
        <p className="text-primary text-sm font-bold">Mahsulotlar</p>
        <h1 className="text-3xl font-black">Yangi mahsulot</h1>
      </header>
      <ProductForm
        brands={brands
          .filter((item) => !item.archivedAt)
          .map(({ id, name }) => ({ id, name }))}
        categories={categories
          .filter((item) => !item.archivedAt)
          .map((item) => ({
            id: item.id,
            name: item.translations[0]?.name ?? "—",
          }))}
        value={{
          translations: Object.values(Locale).map((locale) => ({
            description: "",
            locale,
            name: "",
            slug: "",
          })),
        }}
      />
    </div>
  );
}
