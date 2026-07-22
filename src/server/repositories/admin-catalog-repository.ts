import "server-only";

import { Prisma } from "@/generated/prisma/client";
import {
  Locale,
  ProductStatus,
  ProductType,
  RedirectStatusCode,
} from "@/generated/prisma/enums";
import type { ProductInput, ProductListQuery } from "@/schemas/admin-catalog";
import { getPrismaClient } from "@/server/db/client";

const productInclude = {
  brand: true,
  category: { include: { translations: { where: { locale: Locale.UZ } } } },
  compatibilities: { orderBy: { make: "asc" as const } },
  images: { orderBy: { sortOrder: "asc" as const } },
  motorcycleSpec: true,
  partSpec: true,
  translations: { orderBy: { locale: "asc" as const } },
} satisfies Prisma.ProductInclude;

export function buildProductWhere(
  query: ProductListQuery,
): Prisma.ProductWhereInput {
  return {
    brandId: query.brand,
    categoryId: query.category,
    status: query.status,
    type: query.type,
    ...(query.q
      ? {
          OR: [
            { sku: { contains: query.q, mode: "insensitive" } },
            {
              translations: {
                some: { name: { contains: query.q, mode: "insensitive" } },
              },
            },
            {
              translations: {
                some: { slug: { contains: query.q, mode: "insensitive" } },
              },
            },
            {
              partSpec: {
                is: { partNumber: { contains: query.q, mode: "insensitive" } },
              },
            },
          ],
        }
      : {}),
  };
}

function productOrderBy(
  sort: ProductListQuery["sort"],
): Prisma.ProductOrderByWithRelationInput {
  if (sort === "oldest") return { createdAt: "asc" };
  if (sort === "price-asc") return { price: "asc" };
  if (sort === "price-desc") return { price: "desc" };
  if (sort === "stock-asc") return { stock: "asc" };
  if (sort === "stock-desc") return { stock: "desc" };
  return { createdAt: "desc" };
}

export async function listAdminProducts(query: ProductListQuery) {
  const db = getPrismaClient();
  const pageSize = 10;
  const where = buildProductWhere(query);
  const [items, total] = await Promise.all([
    db.product.findMany({
      include: productInclude,
      orderBy: productOrderBy(query.sort),
      skip: (query.page - 1) * pageSize,
      take: pageSize,
      where,
    }),
    db.product.count({ where }),
  ]);
  return {
    items,
    page: query.page,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
    total,
  };
}

export async function getAdminProduct(id: string) {
  return getPrismaClient().product.findUnique({
    include: productInclude,
    where: { id },
  });
}

export async function getCatalogOptions() {
  const db = getPrismaClient();
  const [categories, brands] = await Promise.all([
    db.category.findMany({
      include: { translations: { where: { locale: Locale.UZ } } },
      orderBy: { sortOrder: "asc" },
    }),
    db.brand.findMany({ orderBy: { name: "asc" } }),
  ]);
  return { brands, categories };
}

function translationData(input: ProductInput) {
  return input.translations.map((translation) => ({
    locale: translation.locale,
    name: translation.name,
    slug: translation.slug,
    description: translation.description,
    seoTitle: translation.seoTitle,
    seoDescription: translation.seoDescription,
  }));
}

export async function saveAdminProduct(input: ProductInput, id?: string) {
  const db = getPrismaClient();
  return db.$transaction(async (tx) => {
    const previousTranslations = id
      ? await tx.productTranslation.findMany({
          where: { productId: id },
          select: { locale: true, slug: true },
        })
      : [];
    if (input.status === ProductStatus.ACTIVE) {
      if (!id) throw new Error("ACTIVE_REQUIRES_PRIMARY_IMAGE");
      const primaryImage = await tx.productImage.count({
        where: { productId: id, isPrimary: true },
      });
      if (primaryImage !== 1) throw new Error("ACTIVE_REQUIRES_PRIMARY_IMAGE");
    }
    const common = {
      brandId: input.brandId ?? null,
      categoryId: input.categoryId,
      compareAtPrice: input.compareAtPrice ?? null,
      condition: input.condition ?? null,
      isFeatured: input.isFeatured,
      price: input.price,
      sku: input.sku,
      status: input.status,
      stock: input.stock,
      type: input.type,
      archivedAt: input.status === ProductStatus.ARCHIVED ? new Date() : null,
    };
    const product = id
      ? await tx.product.update({ data: common, where: { id } })
      : await tx.product.create({ data: { ...common, currency: "UZS" } });

    await Promise.all(
      translationData(input).map((translation) =>
        tx.productTranslation.upsert({
          where: {
            productId_locale: {
              locale: translation.locale,
              productId: product.id,
            },
          },
          create: { ...translation, productId: product.id },
          update: translation,
        }),
      ),
    );
    for (const previous of previousTranslations) {
      const next = input.translations.find(
        (item) => item.locale === previous.locale,
      );
      if (next && next.slug !== previous.slug) {
        const locale = previous.locale.toLowerCase();
        await tx.redirect.upsert({
          where: { sourcePath: `/${locale}/products/${previous.slug}` },
          create: {
            sourcePath: `/${locale}/products/${previous.slug}`,
            destinationPath: `/${locale}/products/${next.slug}`,
            statusCode: RedirectStatusCode.MOVED_PERMANENTLY,
          },
          update: {
            destinationPath: `/${locale}/products/${next.slug}`,
            statusCode: RedirectStatusCode.MOVED_PERMANENTLY,
            isActive: true,
            expiresAt: null,
          },
        });
      }
    }
    if (input.type === ProductType.MOTORCYCLE && input.motorcycle) {
      await tx.motorcycleSpec.upsert({
        where: { productId: product.id },
        create: { ...input.motorcycle, productId: product.id },
        update: input.motorcycle,
      });
      await tx.partSpec.deleteMany({ where: { productId: product.id } });
    } else if (input.type === ProductType.PART && input.part) {
      await tx.partSpec.upsert({
        where: { productId: product.id },
        create: { ...input.part, productId: product.id },
        update: input.part,
      });
      await tx.motorcycleSpec.deleteMany({ where: { productId: product.id } });
    } else {
      await tx.motorcycleSpec.deleteMany({ where: { productId: product.id } });
      await tx.partSpec.deleteMany({ where: { productId: product.id } });
    }
    await tx.productCompatibility.deleteMany({
      where: { productId: product.id },
    });
    if (input.type === ProductType.PART && input.compatibilities.length) {
      await tx.productCompatibility.createMany({
        data: input.compatibilities.map((item) => ({
          ...item,
          productId: product.id,
        })),
      });
    }
    return product;
  });
}

export async function setProductArchived(id: string, archived: boolean) {
  return getPrismaClient().product.update({
    data: {
      archivedAt: archived ? new Date() : null,
      status: archived ? ProductStatus.ARCHIVED : ProductStatus.DRAFT,
    },
    where: { id },
  });
}

export async function listAdminCategories() {
  return getPrismaClient().category.findMany({
    include: {
      translations: { orderBy: { locale: "asc" } },
      _count: { select: { products: true } },
    },
    orderBy: [{ archivedAt: "asc" }, { sortOrder: "asc" }],
  });
}

export async function saveAdminCategory(input: {
  id?: string;
  isActive: boolean;
  sortOrder: number;
  translations: ProductInput["translations"];
}) {
  const db = getPrismaClient();
  return db.$transaction(async (tx) => {
    const category = input.id
      ? await tx.category.update({
          where: { id: input.id },
          data: { isActive: input.isActive, sortOrder: input.sortOrder },
        })
      : await tx.category.create({
          data: { isActive: input.isActive, sortOrder: input.sortOrder },
        });
    await Promise.all(
      input.translations.map((item) =>
        tx.categoryTranslation.upsert({
          where: {
            categoryId_locale: { categoryId: category.id, locale: item.locale },
          },
          create: { ...item, categoryId: category.id },
          update: item,
        }),
      ),
    );
    return category;
  });
}

export async function setCategoryArchived(id: string, archived: boolean) {
  return getPrismaClient().category.update({
    where: { id },
    data: { archivedAt: archived ? new Date() : null, isActive: !archived },
  });
}

export async function listAdminBrands() {
  return getPrismaClient().brand.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: [{ archivedAt: "asc" }, { name: "asc" }],
  });
}

export async function saveAdminBrand(input: {
  id?: string;
  isActive: boolean;
  name: string;
  slug: string;
  websiteUrl?: string;
}) {
  const data = {
    isActive: input.isActive,
    name: input.name,
    slug: input.slug,
    websiteUrl: input.websiteUrl || null,
  };
  return input.id
    ? getPrismaClient().brand.update({ where: { id: input.id }, data })
    : getPrismaClient().brand.create({ data });
}

export async function setBrandArchived(id: string, archived: boolean) {
  return getPrismaClient().brand.update({
    where: { id },
    data: { archivedAt: archived ? new Date() : null, isActive: !archived },
  });
}
