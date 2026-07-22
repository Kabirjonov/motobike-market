import { z } from "zod";

import { OrderStatus, PaymentStatus } from "@/generated/prisma/enums";

const optionalDate = z
  .union([z.literal(""), z.iso.date()])
  .transform((v) => v || undefined)
  .optional();

export const adminOrderQuerySchema = z.object({
  q: z.string().trim().max(100).catch("").default(""),
  status: z.enum(OrderStatus).optional().catch(undefined),
  paymentStatus: z.enum(PaymentStatus).optional().catch(undefined),
  dateFrom: optionalDate,
  dateTo: optionalDate,
  sort: z
    .enum(["newest", "oldest", "total-asc", "total-desc"])
    .catch("newest")
    .default("newest"),
  page: z.coerce.number().int().min(1).catch(1).default(1),
});

export const orderTransitionSchema = z.object({
  orderId: z.string().min(1),
  toStatus: z.enum(OrderStatus),
  note: z.string().trim().min(3, "Izoh kamida 3 belgi bo‘lsin.").max(500),
});

export type AdminOrderQuery = z.infer<typeof adminOrderQuerySchema>;
