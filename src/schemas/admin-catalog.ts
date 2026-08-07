import { z } from "zod";

import {
  Locale,
  ProductColor,
  ProductCondition,
  ProductStatus,
  ProductType,
} from "@/generated/prisma/enums";

const optionalText = z
  .string()
  .trim()
  .transform((value) => value || undefined)
  .optional();
const optionalId = z
  .string()
  .trim()
  .transform((value) => value || undefined)
  .optional();
const money = z
  .string()
  .trim()
  .regex(/^\d{1,10}(\.\d{1,2})?$/, "Narx formati noto‘g‘ri");
const optionalMoney = z
  .string()
  .trim()
  .refine(
    (value) => !value || /^\d{1,10}(\.\d{1,2})?$/.test(value),
    "Narx formati noto‘g‘ri",
  )
  .transform((value) => value || undefined);
const slug = z
  .string()
  .trim()
  .min(2, "Slug kamida 2 belgi")
  .max(120)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Faqat kichik lotin harflari, raqam va tire ishlating",
  );

export const translationSchema = z.object({
  locale: z.enum(Locale),
  name: z.string().trim().min(2, "Nom majburiy").max(160),
  description: z.string().trim().min(10, "Tavsif kamida 10 belgi").max(10_000),
  slug,
  seoTitle: optionalText,
  seoDescription: optionalText,
});

const motorcycleSchema = z.object({
  make: z.string().trim().min(1).max(80),
  model: z.string().trim().min(1).max(80),
  year: z.coerce.number().int().min(1900).max(2100),
  engineCc: z.coerce.number().int().positive().max(10_000),
  mileageKm: z.coerce.number().int().nonnegative().max(2_000_000),
});

const partSchema = z.object({ partNumber: z.string().trim().min(1).max(120) });

export const compatibilitySchema = z.object({
  make: z.string().trim().min(1).max(80),
  model: z.string().trim().min(1).max(80),
  yearFrom: z.coerce.number().int().min(1900).max(2100).optional(),
  yearTo: z.coerce.number().int().min(1900).max(2100).optional(),
  engineCc: z.coerce.number().int().positive().max(10_000).optional(),
  note: optionalText,
});

export const productInputSchema = z
  .object({
    sku: z
      .string()
      .trim()
      .min(2)
      .max(80)
      .transform((value) => value.toUpperCase()),
    type: z.enum(ProductType),
    status: z.enum(ProductStatus),
    condition: z.enum(ProductCondition).optional(),
    color: z.enum(ProductColor).optional(),
    categoryId: z.string().min(1, "Kategoriya majburiy"),
    brandId: optionalId,
    price: money,
    compareAtPrice: optionalMoney,
    stock: z.coerce.number().int().nonnegative().max(1_000_000),
    isFeatured: z.boolean().default(false),
    translations: z.array(translationSchema).length(3),
    motorcycle: motorcycleSchema.optional(),
    part: partSchema.optional(),
    compatibilities: z.array(compatibilitySchema).max(50).default([]),
  })
  .superRefine((input, context) => {
    const locales = new Set(input.translations.map(({ locale }) => locale));
    for (const locale of Object.values(Locale)) {
      if (!locales.has(locale))
        context.addIssue({
          code: "custom",
          message: `${locale} tarjimasi majburiy`,
          path: ["translations"],
        });
    }
    if (input.type === ProductType.MOTORCYCLE && !input.motorcycle) {
      context.addIssue({
        code: "custom",
        message: "Mototsikl texnik maydonlari majburiy",
        path: ["motorcycle"],
      });
    }
    if (input.type === ProductType.PART && !input.part) {
      context.addIssue({
        code: "custom",
        message: "Qism raqami majburiy",
        path: ["part"],
      });
    }
    if (
      input.compareAtPrice &&
      Number(input.compareAtPrice) <= Number(input.price)
    ) {
      context.addIssue({
        code: "custom",
        message: "Eski narx amaldagi narxdan katta bo‘lishi kerak",
        path: ["compareAtPrice"],
      });
    }
    for (const [index, item] of input.compatibilities.entries()) {
      if (item.yearFrom && item.yearTo && item.yearFrom > item.yearTo) {
        context.addIssue({
          code: "custom",
          message: "Boshlanish yili tugash yilidan katta",
          path: ["compatibilities", index, "yearTo"],
        });
      }
    }
  });

export const productListQuerySchema = z.object({
  q: z.string().trim().max(100).optional().catch(undefined),
  status: z.enum(ProductStatus).optional().catch(undefined),
  type: z.enum(ProductType).optional().catch(undefined),
  category: optionalId.catch(undefined),
  brand: optionalId.catch(undefined),
  sort: z
    .enum([
      "newest",
      "oldest",
      "price-asc",
      "price-desc",
      "stock-asc",
      "stock-desc",
    ])
    .default("newest")
    .catch("newest"),
  page: z.coerce.number().int().positive().default(1).catch(1),
});

export const categoryInputSchema = z.object({
  id: optionalId,
  sortOrder: z.coerce.number().int().min(0).max(100_000),
  isActive: z.boolean().default(false),
  translations: z.array(translationSchema).length(3),
});

export const brandInputSchema = z.object({
  id: optionalId,
  name: z.string().trim().min(2).max(120),
  slug,
  websiteUrl: z
    .string()
    .trim()
    .url("URL noto‘g‘ri")
    .optional()
    .or(z.literal("")),
  isActive: z.boolean().default(false),
});

function value(data: FormData, key: string) {
  return String(data.get(key) ?? "");
}

export function productFromFormData(data: FormData) {
  const compatibilities = value(data, "compatibilities")
    .split("\n")
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row) => {
      const [make = "", model = "", yearFrom, yearTo, engineCc, note] = row
        .split("|")
        .map((part) => part.trim());
      return {
        make,
        model,
        yearFrom: yearFrom || undefined,
        yearTo: yearTo || undefined,
        engineCc: engineCc || undefined,
        note: note || undefined,
      };
    });
  const translations = Object.values(Locale).map((locale) => ({
    locale,
    name: value(data, `${locale}.name`),
    slug: value(data, `${locale}.slug`),
    description: value(data, `${locale}.description`),
    seoTitle: value(data, `${locale}.seoTitle`),
    seoDescription: value(data, `${locale}.seoDescription`),
  }));
  const raw = {
    sku: value(data, "sku"),
    type: value(data, "type"),
    status: value(data, "status"),
    condition: value(data, "condition") || undefined,
    color: value(data, "color") || undefined,
    categoryId: value(data, "categoryId"),
    brandId: value(data, "brandId"),
    price: value(data, "price"),
    compareAtPrice: value(data, "compareAtPrice"),
    stock: value(data, "stock"),
    isFeatured: data.get("isFeatured") === "on",
    translations,
    compatibilities,
    motorcycle:
      value(data, "type") === ProductType.MOTORCYCLE
        ? {
            make: value(data, "motorcycle.make"),
            model: value(data, "motorcycle.model"),
            year: value(data, "motorcycle.year"),
            engineCc: value(data, "motorcycle.engineCc"),
            mileageKm: value(data, "motorcycle.mileageKm"),
          }
        : undefined,
    part:
      value(data, "type") === ProductType.PART
        ? { partNumber: value(data, "part.partNumber") }
        : undefined,
  };
  return productInputSchema.safeParse(raw);
}

export function categoryFromFormData(data: FormData) {
  return categoryInputSchema.safeParse({
    id: value(data, "id"),
    sortOrder: value(data, "sortOrder"),
    isActive: data.get("isActive") === "on",
    translations: Object.values(Locale).map((locale) => ({
      locale,
      name: value(data, `${locale}.name`),
      slug: value(data, `${locale}.slug`),
      description: value(data, `${locale}.description`),
      seoTitle: value(data, `${locale}.seoTitle`),
      seoDescription: value(data, `${locale}.seoDescription`),
    })),
  });
}

export function brandFromFormData(data: FormData) {
  return brandInputSchema.safeParse({
    id: value(data, "id"),
    name: value(data, "name"),
    slug: value(data, "slug"),
    websiteUrl: value(data, "websiteUrl"),
    isActive: data.get("isActive") === "on",
  });
}

export type ProductInput = z.infer<typeof productInputSchema>;
export type ProductListQuery = z.infer<typeof productListQuerySchema>;
