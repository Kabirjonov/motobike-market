import {
  FulfillmentStatus,
  OrderStatus,
  PaymentStatus,
} from "@/generated/prisma/enums";
import { assertOrderStatusTransition } from "@/server/services/order-status";

export type StockItem = { productId: string | null; quantity: number };

export function aggregateStockRestore(items: readonly StockItem[]) {
  const quantities = new Map<string, number>();
  for (const item of items)
    if (item.productId)
      quantities.set(
        item.productId,
        (quantities.get(item.productId) ?? 0) + item.quantity,
      );
  return [...quantities].map(([productId, quantity]) => ({
    productId,
    quantity,
  }));
}

export function fulfillmentFor(
  status: OrderStatus,
  current: FulfillmentStatus,
) {
  if (status === OrderStatus.PROCESSING) return FulfillmentStatus.PROCESSING;
  if (status === OrderStatus.SHIPPED) return FulfillmentStatus.SHIPPED;
  if (status === OrderStatus.COMPLETED) return FulfillmentStatus.DELIVERED;
  if (status === OrderStatus.CANCELLED) return FulfillmentStatus.CANCELLED;
  return current;
}

export function planOrderTransition(input: {
  from: OrderStatus;
  to: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  stockRestoredAt: Date | null;
}) {
  if (
    input.from === OrderStatus.CANCELLED &&
    input.to === OrderStatus.CANCELLED &&
    input.stockRestoredAt
  )
    return { idempotent: true as const };
  assertOrderStatusTransition(input.from, input.to);
  if (
    input.to === OrderStatus.CANCELLED &&
    input.paymentStatus === PaymentStatus.PAID
  )
    throw new PaidOrderCancellationError();
  return {
    idempotent: false as const,
    fulfillmentStatus: fulfillmentFor(input.to, input.fulfillmentStatus),
    paymentStatus:
      input.to === OrderStatus.CANCELLED
        ? PaymentStatus.CANCELLED
        : input.paymentStatus,
    restoreStock: input.to === OrderStatus.CANCELLED && !input.stockRestoredAt,
  };
}

export function buildTransitionAudit(input: {
  adminId: string;
  orderId: string;
  fromStatus: OrderStatus;
  toStatus: OrderStatus;
  fromPaymentStatus: PaymentStatus;
  toPaymentStatus: PaymentStatus;
  fromFulfillmentStatus: FulfillmentStatus;
  toFulfillmentStatus: FulfillmentStatus;
  note: string;
}) {
  return {
    orderId: input.orderId,
    actorAdminUserId: input.adminId,
    fromStatus: input.fromStatus,
    toStatus: input.toStatus,
    fromPaymentStatus: input.fromPaymentStatus,
    toPaymentStatus: input.toPaymentStatus,
    fromFulfillmentStatus: input.fromFulfillmentStatus,
    toFulfillmentStatus: input.toFulfillmentStatus,
    note: input.note,
  };
}

export class PaidOrderCancellationError extends Error {
  constructor() {
    super("Paid orders require a refund before cancellation");
    this.name = "PaidOrderCancellationError";
  }
}

export class OrderTransitionConflictError extends Error {
  constructor() {
    super("Order was updated concurrently");
    this.name = "OrderTransitionConflictError";
  }
}
