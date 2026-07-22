import "server-only";

import { Prisma } from "@/generated/prisma/client";
import type { OrderStatus } from "@/generated/prisma/enums";
import { getPrismaClient } from "@/server/db/client";
import {
  aggregateStockRestore,
  buildTransitionAudit,
  OrderTransitionConflictError,
  planOrderTransition,
} from "@/server/orders/transition";

export async function transitionAdminOrder(input: {
  adminId: string;
  orderId: string;
  toStatus: OrderStatus;
  note: string;
}) {
  const db = getPrismaClient();
  return db.$transaction(
    async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: input.orderId },
        include: { items: { select: { productId: true, quantity: true } } },
      });
      if (!order) throw new Error("ORDER_NOT_FOUND");
      const plan = planOrderTransition({
        from: order.status,
        to: input.toStatus,
        paymentStatus: order.paymentStatus,
        fulfillmentStatus: order.fulfillmentStatus,
        stockRestoredAt: order.stockRestoredAt,
      });
      if (plan.idempotent) return order;
      const now = new Date();
      const changed = await tx.order.updateMany({
        where: {
          id: order.id,
          status: order.status,
          ...(plan.restoreStock ? { stockRestoredAt: null } : {}),
        },
        data: {
          status: input.toStatus,
          paymentStatus: plan.paymentStatus,
          fulfillmentStatus: plan.fulfillmentStatus,
          ...(plan.restoreStock ? { stockRestoredAt: now } : {}),
        },
      });
      if (changed.count !== 1) throw new OrderTransitionConflictError();
      if (plan.restoreStock)
        for (const item of aggregateStockRestore(order.items))
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
      await tx.orderStatusHistory.create({
        data: buildTransitionAudit({
          adminId: input.adminId,
          orderId: order.id,
          fromStatus: order.status,
          toStatus: input.toStatus,
          fromPaymentStatus: order.paymentStatus,
          toPaymentStatus: plan.paymentStatus,
          fromFulfillmentStatus: order.fulfillmentStatus,
          toFulfillmentStatus: plan.fulfillmentStatus,
          note: input.note,
        }),
      });
      return tx.order.findUniqueOrThrow({ where: { id: order.id } });
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}
