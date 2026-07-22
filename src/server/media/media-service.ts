import "server-only";

import { getPrismaClient } from "@/server/db/client";
import {
  normalizeImageOrder,
  validateImageUpload,
} from "@/server/media/image-security";
import { getMediaStorage } from "@/server/media/storage";
import { logServerError } from "@/server/observability/logger";

export async function uploadProductImage(
  productId: string,
  file: File,
  alt: { altUz: string; altRu?: string; altEn?: string },
) {
  const db = getPrismaClient();
  const product = await db.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });
  if (!product) throw new Error("PRODUCT_NOT_FOUND");
  const count = await db.productImage.count({ where: { productId } });
  if (count >= 20) throw new Error("IMAGE_LIMIT");
  const image = await validateImageUpload(file);
  const storage = getMediaStorage();
  const stored = await storage.put(image.objectKey, image);
  try {
    return await db.productImage.create({
      data: {
        ...alt,
        height: image.height,
        isPrimary: count === 0,
        objectKey: image.objectKey,
        productId,
        sortOrder: count,
        url: stored.url,
        width: image.width,
      },
    });
  } catch (error) {
    await storage.delete(image.objectKey).catch(() => undefined);
    throw error;
  }
}

export async function deleteProductImage(productId: string, imageId: string) {
  const db = getPrismaClient();
  const storage = getMediaStorage();
  const image = await db.productImage.findFirst({
    where: { id: imageId, productId },
  });
  if (!image) throw new Error("IMAGE_NOT_FOUND");
  const product = await db.product.findUnique({
    where: { id: productId },
    select: { status: true, _count: { select: { images: true } } },
  });
  if (product?.status === "ACTIVE" && product._count.images <= 1)
    throw new Error("ACTIVE_REQUIRES_PRIMARY_IMAGE");
  await db.$transaction(async (tx) => {
    await tx.productImage.delete({ where: { id: image.id } });
    const remaining = await tx.productImage.findMany({
      where: { productId },
      orderBy: { sortOrder: "asc" },
    });
    if (image.isPrimary && remaining[0])
      await tx.productImage.update({
        where: { id: remaining[0].id },
        data: { isPrimary: true },
      });
    await Promise.all(
      remaining.map((item, sortOrder) =>
        tx.productImage.update({ where: { id: item.id }, data: { sortOrder } }),
      ),
    );
  });
  await storage.delete(image.objectKey).catch((error) =>
    logServerError("media.orphan_cleanup_failed", error, {
      objectKey: image.objectKey,
    }),
  );
}

export async function setPrimaryProductImage(
  productId: string,
  imageId: string,
) {
  const db = getPrismaClient();
  const image = await db.productImage.findFirst({
    where: { id: imageId, productId },
  });
  if (!image) throw new Error("IMAGE_NOT_FOUND");
  await db.$transaction([
    db.productImage.updateMany({
      where: { productId },
      data: { isPrimary: false },
    }),
    db.productImage.update({
      where: { id: imageId },
      data: { isPrimary: true },
    }),
  ]);
}
export async function reorderProductImages(
  productId: string,
  imageIds: string[],
) {
  const db = getPrismaClient();
  const existing = await db.productImage.findMany({
    where: { productId },
    select: { id: true },
  });
  const order = normalizeImageOrder(
    imageIds,
    existing.map(({ id }) => id),
  );
  await db.$transaction(
    order.map((item) =>
      db.productImage.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder },
      }),
    ),
  );
}
export async function updateProductImageAlt(
  productId: string,
  imageId: string,
  alt: { altUz: string; altRu?: string; altEn?: string },
) {
  const result = await getPrismaClient().productImage.updateMany({
    where: { id: imageId, productId },
    data: alt,
  });
  if (!result.count) throw new Error("IMAGE_NOT_FOUND");
}
