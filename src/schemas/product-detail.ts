import { z } from "zod";
export const productDetailParamsSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});
export const productDetailQuerySchema = z.object({
  lang: z.enum(["uz", "ru", "en"]).default("uz").catch("uz"),
  preview: z.literal("1").optional().catch(undefined),
});
