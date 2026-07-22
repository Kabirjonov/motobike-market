import type { PrismaClient } from "@/generated/prisma/client";
import {
  Locale,
  ProductStatus,
  type ProductType,
} from "@/generated/prisma/enums";

export type ProductListFilters = Readonly<{
  categoryId?: string;
  limit?: number;
  type?: ProductType;
}>;

export class ProductRepository {
  constructor(private readonly db: PrismaClient) {}

  findActiveBySlug(locale: Locale, slug: string) {
    return this.db.productTranslation
      .findUnique({
        where: {
          locale_slug: { locale, slug },
        },
        include: {
          product: {
            include: {
              brand: true,
              category: {
                include: {
                  translations: {
                    where: { locale: { in: [locale, Locale.UZ] } },
                  },
                },
              },
              compatibilities: true,
              images: { orderBy: { sortOrder: "asc" } },
              motorcycleSpec: true,
              partSpec: true,
              translations: {
                where: { locale: { in: [locale, Locale.UZ] } },
              },
            },
          },
        },
      })
      .then((translation) => {
        if (
          translation?.product.status !== ProductStatus.ACTIVE ||
          translation.product.archivedAt !== null
        ) {
          return null;
        }

        return translation;
      });
  }

  listActive(filters: ProductListFilters = {}) {
    const limit = Math.min(Math.max(filters.limit ?? 24, 1), 100);

    return this.db.product.findMany({
      where: {
        archivedAt: null,
        categoryId: filters.categoryId,
        status: ProductStatus.ACTIVE,
        type: filters.type,
      },
      include: {
        brand: true,
        images: {
          orderBy: { sortOrder: "asc" },
          take: 1,
        },
        translations: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }
}
