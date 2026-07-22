import "server-only";

import type { CheckoutInput } from "@/schemas/checkout";

export interface DeliveryProvider {
  quote(
    method: CheckoutInput["deliveryMethod"],
  ): Promise<{ fee: string; label: string }>;
}
export interface PaymentProvider {
  method: "CASH_ON_DELIVERY";
  initialStatus: "PENDING";
}
export interface OrderNotificationAdapter {
  orderCreated(order: { orderNumber: string; phone: string }): Promise<void>;
}

export class MvpDeliveryProvider implements DeliveryProvider {
  async quote(method: CheckoutInput["deliveryMethod"]) {
    return method === "PICKUP"
      ? { fee: "0.00", label: "Olib ketish" }
      : { fee: "25000.00", label: "Kuryer" };
  }
}
export class CashOnDeliveryProvider implements PaymentProvider {
  readonly method = "CASH_ON_DELIVERY" as const;
  readonly initialStatus = "PENDING" as const;
}
export class LogOrderNotificationAdapter implements OrderNotificationAdapter {
  async orderCreated(order: { orderNumber: string; phone: string }) {
    if (process.env.NODE_ENV !== "test")
      console.info("Order notification queued", {
        orderNumber: order.orderNumber,
        phoneSuffix: order.phone.slice(-4),
      });
  }
}
