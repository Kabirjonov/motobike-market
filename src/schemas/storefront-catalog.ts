import { z } from "zod";

import { ProductCondition, ProductType } from "@/generated/prisma/enums";

const optionalText = z
  .string()
  .trim()
  .max(100)
  .transform((value) => value || undefined)
  .optional();
export const storefrontCatalogQuerySchema = z
  .object({
    q: optionalText.catch(undefined),
    type: z.enum(ProductType).optional().catch(undefined),
    category: optionalText.catch(undefined),
    brand: optionalText.catch(undefined),
    condition: z.enum(ProductCondition).optional().catch(undefined),
    minPrice: z.coerce.number().nonnegative().optional().catch(undefined),
    maxPrice: z.coerce.number().nonnegative().optional().catch(undefined),
    sort: z
      .enum(["newest", "price-asc", "price-desc"])
      .default("newest")
      .catch("newest"),
    page: z.coerce.number().int().positive().default(1).catch(1),
  })
  .refine(
    (value) =>
      value.minPrice === undefined ||
      value.maxPrice === undefined ||
      value.minPrice <= value.maxPrice,
    {
      message: "Minimal narx maksimal narxdan oshmasligi kerak",
      path: ["minPrice"],
    },
  );

export type StorefrontCatalogQuery = z.infer<
  typeof storefrontCatalogQuerySchema
>;
