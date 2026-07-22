import { describe, expect, it, vi } from "vitest";

import type { PrismaClient } from "@/generated/prisma/client";

import { OrderRepository } from "./order-repository";

describe("OrderRepository", () => {
  it("loads immutable items and chronological status history", async () => {
    const db = {
      order: { findUnique: vi.fn().mockResolvedValue(null) },
    } as unknown as PrismaClient;

    await new OrderRepository(db).findByOrderNumber("MB-TEST-001");

    expect(db.order.findUnique).toHaveBeenCalledWith({
      where: { orderNumber: "MB-TEST-001" },
      include: {
        items: { orderBy: { createdAt: "asc" } },
        statusHistory: { orderBy: { createdAt: "asc" } },
      },
    });
  });
});
