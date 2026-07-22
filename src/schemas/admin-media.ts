import { z } from "zod";
export const altTextSchema = z.object({
  altUz: z.string().trim().min(2).max(180),
  altRu: z.string().trim().max(180).optional(),
  altEn: z.string().trim().max(180).optional(),
});
export const imageIdSchema = z.string().cuid();
export const productIdSchema = z.string().cuid();
export const reorderImagesSchema = z.object({
  productId: z.string().cuid(),
  imageIds: z.array(imageIdSchema).min(1).max(20),
});
