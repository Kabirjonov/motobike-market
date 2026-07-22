import { z } from "zod";

const phone = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s()-]/g, ""))
  .refine(
    (value) => /^\+998\d{9}$/.test(value),
    "Telefon +998XXXXXXXXX formatida bo‘lishi kerak",
  );
const cartItem = z
  .object({
    productId: z.string().cuid(),
    quantity: z.number().int().min(1).max(99),
  })
  .strict();
export const checkoutSchema = z
  .object({
    idempotencyKey: z.string().uuid(),
    customerName: z.string().trim().min(2).max(120),
    phone,
    email: z.string().trim().email().optional().or(z.literal("")),
    region: z.string().trim().min(2).max(120),
    city: z.string().trim().min(2).max(120),
    addressLine: z.string().trim().min(5).max(300),
    postalCode: z.string().trim().max(20).optional(),
    note: z.string().trim().max(1000).optional(),
    deliveryMethod: z.enum(["COURIER", "PICKUP"]),
    paymentMethod: z.literal("CASH_ON_DELIVERY"),
    items: z.array(cartItem).min(1).max(50),
  })
  .strict()
  .superRefine((value, context) => {
    const ids = new Set(value.items.map(({ productId }) => productId));
    if (ids.size !== value.items.length)
      context.addIssue({
        code: "custom",
        message: "Bir mahsulot bir marta yuborilishi kerak",
        path: ["items"],
      });
  });
export type CheckoutInput = z.infer<typeof checkoutSchema>;
