import "server-only";

import { getPrismaClient } from "@/server/db/client";
export async function getPublicOrderReceipt(orderNumber: string) {
  const order = await getPrismaClient().order.findUnique({
    where: { orderNumber },
    select: {
      orderNumber: true,
      status: true,
      paymentStatus: true,
      total: true,
      currency: true,
      createdAt: true,
    },
  });
  return order ? { ...order, total: order.total.toString() } : null;
}
