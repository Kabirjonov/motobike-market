import { describe, expect, it } from "vitest";

import { OrderStatus } from "@/generated/prisma/enums";

import {
  assertOrderStatusTransition,
  canTransitionOrderStatus,
  InvalidOrderStatusTransitionError,
} from "./order-status";

describe("order status rules", () => {
  it("allows the documented forward path", () => {
    expect(
      canTransitionOrderStatus(OrderStatus.PENDING, OrderStatus.CONFIRMED),
    ).toBe(true);
    expect(
      canTransitionOrderStatus(OrderStatus.SHIPPED, OrderStatus.COMPLETED),
    ).toBe(true);
  });

  it("rejects reopening a terminal order", () => {
    expect(() =>
      assertOrderStatusTransition(OrderStatus.COMPLETED, OrderStatus.PENDING),
    ).toThrow(InvalidOrderStatusTransitionError);
  });

  it("allows cancellation only before shipment", () => {
    expect(
      canTransitionOrderStatus(OrderStatus.PENDING, OrderStatus.CANCELLED),
    ).toBe(true);
    expect(
      canTransitionOrderStatus(OrderStatus.CONFIRMED, OrderStatus.CANCELLED),
    ).toBe(true);
    expect(
      canTransitionOrderStatus(OrderStatus.PROCESSING, OrderStatus.CANCELLED),
    ).toBe(true);
    expect(
      canTransitionOrderStatus(OrderStatus.SHIPPED, OrderStatus.CANCELLED),
    ).toBe(false);
  });
});
