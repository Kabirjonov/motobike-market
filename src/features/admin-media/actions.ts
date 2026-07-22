"use server";

import { revalidatePath, updateTag } from "next/cache";

import {
  altTextSchema,
  imageIdSchema,
  productIdSchema,
  reorderImagesSchema,
} from "@/schemas/admin-media";
import { getCurrentAdmin } from "@/server/auth/authorization";
import { canManageCatalog } from "@/server/auth/catalog-policy";
import { UnsafeImageError } from "@/server/media/image-security";
import {
  deleteProductImage,
  reorderProductImages,
  setPrimaryProductImage,
  updateProductImageAlt,
  uploadProductImage,
} from "@/server/media/media-service";

export type MediaActionState = { message: string; success?: boolean };
async function authorized() {
  return canManageCatalog(await getCurrentAdmin());
}
function refresh(productId: string) {
  updateTag("products");
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/catalog", "layout");
  revalidatePath("/products", "layout");
}

export async function uploadImageAction(
  productId: string,
  _state: MediaActionState,
  data: FormData,
): Promise<MediaActionState> {
  if (!(await authorized()) || !productIdSchema.safeParse(productId).success)
    return { message: "Katalog boshqaruvchisi huquqi kerak." };
  const file = data.get("file");
  const alt = altTextSchema.safeParse({
    altUz: data.get("altUz"),
    altRu: data.get("altRu") || undefined,
    altEn: data.get("altEn") || undefined,
  });
  if (!(file instanceof File) || !alt.success)
    return { message: "Rasm va UZ alt matnini tekshiring." };
  try {
    await uploadProductImage(productId, file, alt.data);
    refresh(productId);
    return { message: "Rasm yuklandi.", success: true };
  } catch (error) {
    return {
      message:
        error instanceof UnsafeImageError
          ? error.message
          : error instanceof Error && error.message === "IMAGE_LIMIT"
            ? "Ko‘pi bilan 20 ta rasm yuklash mumkin."
            : "Rasmni saqlashda xato yuz berdi.",
    };
  }
}

export async function deleteImageAction(productId: string, imageId: string) {
  if (
    !(await authorized()) ||
    !productIdSchema.safeParse(productId).success ||
    !imageIdSchema.safeParse(imageId).success
  )
    return;
  await deleteProductImage(productId, imageId);
  refresh(productId);
}
export async function primaryImageAction(productId: string, imageId: string) {
  if (
    !(await authorized()) ||
    !productIdSchema.safeParse(productId).success ||
    !imageIdSchema.safeParse(imageId).success
  )
    return;
  await setPrimaryProductImage(productId, imageId);
  refresh(productId);
}
export async function updateAltAction(
  productId: string,
  imageId: string,
  data: FormData,
) {
  if (
    !(await authorized()) ||
    !productIdSchema.safeParse(productId).success ||
    !imageIdSchema.safeParse(imageId).success
  )
    return;
  const alt = altTextSchema.safeParse({
    altUz: data.get("altUz"),
    altRu: data.get("altRu") || undefined,
    altEn: data.get("altEn") || undefined,
  });
  if (!alt.success) return;
  await updateProductImageAlt(productId, imageId, alt.data);
  refresh(productId);
}
export async function reorderImagesAction(
  productId: string,
  imageIds: string[],
) {
  if (!(await authorized())) return;
  const parsed = reorderImagesSchema.safeParse({ productId, imageIds });
  if (!parsed.success) return;
  await reorderProductImages(parsed.data.productId, parsed.data.imageIds);
  refresh(productId);
}
