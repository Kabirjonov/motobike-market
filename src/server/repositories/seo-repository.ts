import "server-only";

import { ProductStatus } from "@/generated/prisma/enums";
import { getPrismaClient } from "@/server/db/client";

export async function getIndexableCatalogUrls() {
  const db = getPrismaClient();
  const [products, categories, brands] = await Promise.all([
    db.product.findMany({
      where: { status: ProductStatus.ACTIVE, archivedAt: null },
      select: {
        updatedAt: true,
        translations: { select: { locale: true, slug: true } },
        images: { where: { isPrimary: true }, take: 1, select: { url: true } },
      },
      orderBy: { id: "asc" },
    }),
    db.category.findMany({
      where: { isActive: true, archivedAt: null },
      select: {
        updatedAt: true,
        translations: { select: { locale: true, slug: true } },
      },
      orderBy: { id: "asc" },
    }),
    db.brand.findMany({
      where: { isActive: true, archivedAt: null },
      select: { slug: true, updatedAt: true },
      orderBy: { id: "asc" },
    }),
  ]);
  return { products, categories, brands };
}
