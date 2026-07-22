import { OrderStatus } from "@/generated/prisma/enums";

const allowedTransitions: Readonly<
  Record<OrderStatus, readonly OrderStatus[]>
> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.COMPLETED],
  [OrderStatus.COMPLETED]: [],
  [OrderStatus.CANCELLED]: [],
};

export function canTransitionOrderStatus(from: OrderStatus, to: OrderStatus) {
  return allowedTransitions[from].includes(to);
}

export function getAllowedOrderTransitions(from: OrderStatus) {
  return allowedTransitions[from];
}

export function assertOrderStatusTransition(
  from: OrderStatus,
  to: OrderStatus,
): void {
  if (!canTransitionOrderStatus(from, to)) {
    throw new InvalidOrderStatusTransitionError(from, to);
  }
}

export class InvalidOrderStatusTransitionError extends Error {
  constructor(
    public readonly from: OrderStatus,
    public readonly to: OrderStatus,
  ) {
    super(`Order status cannot transition from ${from} to ${to}`);
    this.name = "InvalidOrderStatusTransitionError";
  }
}
