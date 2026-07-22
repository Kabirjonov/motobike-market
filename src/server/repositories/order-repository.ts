import type { PrismaClient } from "@/generated/prisma/client";

export class OrderRepository {
  constructor(private readonly db: PrismaClient) {}

  findByOrderNumber(orderNumber: string) {
    return this.db.order.findUnique({
      where: { orderNumber },
      include: {
        items: { orderBy: { createdAt: "asc" } },
        statusHistory: { orderBy: { createdAt: "asc" } },
      },
    });
  }
}
