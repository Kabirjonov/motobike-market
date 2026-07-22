import { describe, expect, it } from "vitest";

import {
  FulfillmentStatus,
  OrderStatus,
  PaymentStatus,
} from "@/generated/prisma/enums";

import {
  aggregateStockRestore,
  buildTransitionAudit,
  PaidOrderCancellationError,
  planOrderTransition,
} from "./transition";

describe("order transition transaction rules", () => {
  it("aggregates each product stock exactly once", () => {
    expect(
      aggregateStockRestore([
        { productId: "p1", quantity: 2 },
        { productId: "p1", quantity: 3 },
        { productId: "p2", quantity: 1 },
        { productId: null, quantity: 9 },
      ]),
    ).toEqual([
      { productId: "p1", quantity: 5 },
      { productId: "p2", quantity: 1 },
    ]);
  });

  it("makes an already restored cancellation idempotent", () => {
    expect(
      planOrderTransition({
        from: OrderStatus.CANCELLED,
        to: OrderStatus.CANCELLED,
        paymentStatus: PaymentStatus.CANCELLED,
        fulfillmentStatus: FulfillmentStatus.CANCELLED,
        stockRestoredAt: new Date(),
      }),
    ).toEqual({ idempotent: true });
  });

  it("plans cancellation status and one stock restore", () => {
    expect(
      planOrderTransition({
        from: OrderStatus.CONFIRMED,
        to: OrderStatus.CANCELLED,
        paymentStatus: PaymentStatus.PENDING,
        fulfillmentStatus: FulfillmentStatus.UNFULFILLED,
        stockRestoredAt: null,
      }),
    ).toMatchObject({
      idempotent: false,
      restoreStock: true,
      paymentStatus: PaymentStatus.CANCELLED,
      fulfillmentStatus: FulfillmentStatus.CANCELLED,
    });
  });

  it("rejects cancellation of a paid order", () => {
    expect(() =>
      planOrderTransition({
        from: OrderStatus.CONFIRMED,
        to: OrderStatus.CANCELLED,
        paymentStatus: PaymentStatus.PAID,
        fulfillmentStatus: FulfillmentStatus.UNFULFILLED,
        stockRestoredAt: null,
      }),
    ).toThrow(PaidOrderCancellationError);
  });

  it("records the admin, old/new states and note in audit data", () => {
    expect(
      buildTransitionAudit({
        adminId: "a1",
        orderId: "o1",
        fromStatus: OrderStatus.PENDING,
        toStatus: OrderStatus.CONFIRMED,
        fromPaymentStatus: PaymentStatus.PENDING,
        toPaymentStatus: PaymentStatus.PENDING,
        fromFulfillmentStatus: FulfillmentStatus.UNFULFILLED,
        toFulfillmentStatus: FulfillmentStatus.UNFULFILLED,
        note: "Customer confirmed",
      }),
    ).toMatchObject({
      actorAdminUserId: "a1",
      fromStatus: OrderStatus.PENDING,
      toStatus: OrderStatus.CONFIRMED,
      note: "Customer confirmed",
    });
  });
});
