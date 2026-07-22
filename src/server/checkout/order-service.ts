import "server-only";

import { createHash, randomBytes } from "node:crypto";

import { Prisma } from "@/generated/prisma/client";
import { Locale, OrderStatus, ProductStatus } from "@/generated/prisma/enums";
import type { CheckoutInput } from "@/schemas/checkout";
import {
  calculateCartTotal,
  decimalToMinor,
  minorToDecimal,
} from "@/server/checkout/money";
import {
  CashOnDeliveryProvider,
  LogOrderNotificationAdapter,
  MvpDeliveryProvider,
} from "@/server/checkout/providers";
import {
  reserveStockLines,
  StockReservationError,
} from "@/server/checkout/stock-reservation";
import { getPrismaClient } from "@/server/db/client";
import { logServerError } from "@/server/observability/logger";

export class CheckoutError extends Error {
  constructor(
    public code: "CART_CHANGED" | "IDEMPOTENCY_CONFLICT" | "INSUFFICIENT_STOCK",
    message: string,
  ) {
    super(message);
  }
}
function fingerprint(input: CheckoutInput) {
  return createHash("sha256").update(JSON.stringify(input)).digest("hex");
}
function orderNumber() {
  return `MB-${randomBytes(12).toString("hex").toUpperCase()}`;
}

export async function createCheckoutOrder(input: CheckoutInput) {
  const db = getPrismaClient();
  const requestFingerprint = fingerprint(input);
  const existing = await db.order.findUnique({
    where: { idempotencyKey: input.idempotencyKey },
    select: { orderNumber: true, status: true, checkoutFingerprint: true },
  });
  if (existing) {
    if (existing.checkoutFingerprint !== requestFingerprint)
      throw new CheckoutError(
        "IDEMPOTENCY_CONFLICT",
        "Bu checkout kaliti boshqa buyurtmada ishlatilgan",
      );
    return existing;
  }
  const delivery = await new MvpDeliveryProvider().quote(input.deliveryMethod);
  const payment = new CashOnDeliveryProvider();
  try {
    const order = await db.$transaction(
      async (tx) => {
        const products = await tx.product.findMany({
          where: { id: { in: input.items.map(({ productId }) => productId) } },
          select: {
            id: true,
            sku: true,
            type: true,
            status: true,
            archivedAt: true,
            stock: true,
            price: true,
            currency: true,
            translations: {
              where: { locale: Locale.UZ },
              select: { name: true, slug: true },
              take: 1,
            },
          },
        });
        if (
          products.length !== input.items.length ||
          products.some(
            (product) =>
              product.status !== ProductStatus.ACTIVE || product.archivedAt,
          )
        )
          throw new CheckoutError(
            "CART_CHANGED",
            "Savatdagi ayrim mahsulotlar sotuvda yo‘q",
          );
        const currencies = new Set(products.map(({ currency }) => currency));
        if (currencies.size !== 1)
          throw new CheckoutError(
            "CART_CHANGED",
            "Turli valyutadagi mahsulotlar qo‘llanmaydi",
          );
        const lines = input.items.map((item) => {
          const product = products.find(({ id }) => id === item.productId)!;
          const translation = product.translations[0];
          if (!translation)
            throw new CheckoutError(
              "CART_CHANGED",
              "Mahsulot tarjimasi topilmadi",
            );
          return {
            product,
            quantity: item.quantity,
            name: translation.name,
            slug: translation.slug,
            lineTotal: calculateCartTotal([
              { price: product.price.toString(), quantity: item.quantity },
            ]),
          };
        });
        try {
          await reserveStockLines(
            lines.map((line) => ({ ...line, productId: line.product.id })),
            async (line) => {
              const reserved = await tx.product.updateMany({
                where: {
                  id: line.productId,
                  status: ProductStatus.ACTIVE,
                  archivedAt: null,
                  stock: { gte: line.quantity },
                },
                data: { stock: { decrement: line.quantity } },
              });
              return reserved.count === 1;
            },
          );
        } catch (error) {
          if (error instanceof StockReservationError) {
            const line = lines.find(
              ({ product }) => product.id === error.message,
            );
            throw new CheckoutError(
              "INSUFFICIENT_STOCK",
              `${line?.name ?? "Mahsulot"} uchun stock yetarli emas`,
            );
          }
          throw error;
        }
        const subtotal = calculateCartTotal(
          lines.map((line) => ({
            price: line.product.price.toString(),
            quantity: line.quantity,
          })),
        );
        const total = minorToDecimal(
          decimalToMinor(subtotal) + decimalToMinor(delivery.fee),
        );
        const currency = products[0]!.currency;
        return tx.order.create({
          data: {
            orderNumber: orderNumber(),
            idempotencyKey: input.idempotencyKey,
            checkoutFingerprint: requestFingerprint,
            customerName: input.customerName,
            phone: input.phone,
            email: input.email || null,
            region: input.region,
            city: input.city,
            addressLine: input.addressLine,
            postalCode: input.postalCode || null,
            note: input.note || null,
            deliveryMethod: input.deliveryMethod,
            paymentMethod: payment.method,
            paymentStatus: payment.initialStatus,
            subtotal,
            deliveryFee: delivery.fee,
            total,
            currency,
            items: {
              create: lines.map((line) => ({
                productId: line.product.id,
                productType: line.product.type,
                name: line.name,
                sku: line.product.sku,
                slug: line.slug,
                unitPrice: line.product.price,
                quantity: line.quantity,
                lineTotal: line.lineTotal,
              })),
            },
            statusHistory: {
              create: {
                toStatus: OrderStatus.PENDING,
                note: "Guest checkout orqali yaratildi",
              },
            },
          },
          select: { orderNumber: true, status: true, phone: true },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
    await new LogOrderNotificationAdapter().orderCreated(order).catch((error) =>
      logServerError("order.notification_failed", error, {
        orderNumber: order.orderNumber,
      }),
    );
    return { orderNumber: order.orderNumber, status: order.status };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const duplicate = await db.order.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
        select: { orderNumber: true, status: true, checkoutFingerprint: true },
      });
      if (duplicate?.checkoutFingerprint === requestFingerprint)
        return { orderNumber: duplicate.orderNumber, status: duplicate.status };
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2034"
    )
      throw new CheckoutError(
        "CART_CHANGED",
        "Stock bir vaqtda o‘zgardi. Savatni tekshirib qayta urinib ko‘ring.",
      );
    throw error;
  }
}
