"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";

import {
  brandFromFormData,
  categoryFromFormData,
  productFromFormData,
} from "@/schemas/admin-catalog";
import { getCurrentAdmin } from "@/server/auth/authorization";
import { canManageCatalog } from "@/server/auth/catalog-policy";
import {
  saveAdminBrand,
  saveAdminCategory,
  saveAdminProduct,
  setBrandArchived,
  setCategoryArchived,
  setProductArchived,
} from "@/server/repositories/admin-catalog-repository";

export type CatalogActionState = {
  message: string;
  fieldErrors?: Record<string, string[]>;
};

async function authorize() {
  return canManageCatalog(await getCurrentAdmin());
}

function validationState(error: {
  flatten(): { fieldErrors: Record<string, string[]> };
}): CatalogActionState {
  return {
    message: "Kiritilgan ma’lumotlarni tekshiring.",
    fieldErrors: error.flatten().fieldErrors,
  };
}

function databaseError(error: unknown): CatalogActionState {
  if (
    error instanceof Error &&
    error.message === "ACTIVE_REQUIRES_PRIMARY_IMAGE"
  )
    return {
      message:
        "Active mahsulot uchun bitta primary rasm majburiy. Avval Draft sifatida saqlab, rasm yuklang.",
    };
  const meta =
    typeof error === "object" && error && "meta" in error
      ? (error as { meta?: { target?: string[] | string } }).meta
      : undefined;
  const target = Array.isArray(meta?.target)
    ? meta.target.join(" ")
    : String(meta?.target ?? "");
  if (target.includes("sku"))
    return {
      message: "Bu SKU allaqachon ishlatilgan.",
      fieldErrors: { sku: ["Boshqa SKU kiriting."] },
    };
  if (target.includes("slug"))
    return {
      message: "Slug to‘qnashuvi: bu til uchun slug band.",
      fieldErrors: { translations: ["Har bir tilda noyob slug kiriting."] },
    };
  return { message: "Saqlashda xato yuz berdi. Qayta urinib ko‘ring." };
}

function revalidateCatalog() {
  updateTag("products");
  updateTag("catalog-facets");
  revalidatePath("/admin/products");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/brands");
  revalidatePath("/catalog", "layout");
  revalidatePath("/products", "layout");
}

export async function saveProductAction(
  id: string | undefined,
  _state: CatalogActionState,
  formData: FormData,
): Promise<CatalogActionState> {
  if (!(await authorize()))
    return { message: "Bu amal uchun katalog boshqaruvchisi huquqi kerak." };
  const parsed = productFromFormData(formData);
  if (!parsed.success) return validationState(parsed.error);
  try {
    const product = await saveAdminProduct(parsed.data, id);
    revalidateCatalog();
    redirect(`/admin/products/${product.id}?saved=1`);
  } catch (error) {
    if (typeof error === "object" && error && "digest" in error) throw error;
    return databaseError(error);
  }
}

export async function archiveProductAction(id: string, archived: boolean) {
  if (!(await authorize())) return;
  await setProductArchived(id, archived);
  revalidateCatalog();
  redirect(`/admin/products?saved=${archived ? "archived" : "restored"}`);
}

export async function saveCategoryAction(
  _state: CatalogActionState,
  formData: FormData,
): Promise<CatalogActionState> {
  if (!(await authorize()))
    return { message: "Bu amal uchun katalog boshqaruvchisi huquqi kerak." };
  const parsed = categoryFromFormData(formData);
  if (!parsed.success) return validationState(parsed.error);
  try {
    await saveAdminCategory(parsed.data);
    revalidateCatalog();
    redirect("/admin/categories?saved=1");
  } catch (error) {
    if (typeof error === "object" && error && "digest" in error) throw error;
    return databaseError(error);
  }
}

export async function archiveCategoryAction(id: string, archived: boolean) {
  if (!(await authorize())) return;
  await setCategoryArchived(id, archived);
  revalidateCatalog();
}

export async function saveBrandAction(
  _state: CatalogActionState,
  formData: FormData,
): Promise<CatalogActionState> {
  if (!(await authorize()))
    return { message: "Bu amal uchun katalog boshqaruvchisi huquqi kerak." };
  const parsed = brandFromFormData(formData);
  if (!parsed.success) return validationState(parsed.error);
  try {
    await saveAdminBrand(parsed.data);
    revalidateCatalog();
    redirect("/admin/brands?saved=1");
  } catch (error) {
    if (typeof error === "object" && error && "digest" in error) throw error;
    return databaseError(error);
  }
}

export async function archiveBrandAction(id: string, archived: boolean) {
  if (!(await authorize())) return;
  await setBrandArchived(id, archived);
  revalidateCatalog();
}
