import { PrismaPg } from "@prisma/adapter-pg";
import { afterAll, describe, expect, it } from "vitest";

import { PrismaClient } from "@/generated/prisma/client";
import {
  FulfillmentStatus,
  Locale,
  OrderStatus,
  PaymentStatus,
} from "@/generated/prisma/enums";
import { resolveAuthorizedAdmin } from "@/server/auth/authorization-policy";
import { createCheckoutOrder } from "@/server/checkout/order-service";
import { transitionAdminOrder } from "@/server/orders/order-transition-service";
import { saveAdminCategory } from "@/server/repositories/admin-catalog-repository";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});
afterAll(() => db.$disconnect());

describe.sequential("Prisma-backed business flow", () => {
  it("creates and updates an admin category with normalized translations", async () => {
    const translations = [Locale.UZ, Locale.RU, Locale.EN].map((locale) => ({
      locale,
      name: `Integration ${locale}`,
      slug: `integration-${locale.toLowerCase()}`,
      description: `Description ${locale}`,
    }));
    const created = await saveAdminCategory({
      isActive: true,
      sortOrder: 99,
      translations,
    });
    await saveAdminCategory({
      id: created.id,
      isActive: false,
      sortOrder: 100,
      translations: translations.map((item) => ({
        ...item,
        name: `${item.name} updated`,
      })),
    });
    const stored = await db.category.findUniqueOrThrow({
      where: { id: created.id },
      include: { translations: true },
    });
    expect(stored).toMatchObject({ isActive: false, sortOrder: 100 });
    expect(stored.translations).toHaveLength(3);
    await db.category.delete({ where: { id: created.id } });
  });

  it("rechecks DB identity for the auth guard", async () => {
    const admin = await db.adminUser.findUniqueOrThrow({
      where: { email: process.env.SEED_ADMIN_EMAIL! },
    });
    const session = {
      expires: new Date(Date.now() + 60_000).toISOString(),
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    };
    const resolved = await resolveAuthorizedAdmin(session, (id) =>
      db.adminUser.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          deletedAt: true,
        },
      }),
    );
    expect(resolved?.id).toBe(admin.id);
  });

  it("creates checkout transaction then cancels once with stock and audit restoration", async () => {
    const product = await db.product.findUniqueOrThrow({
      where: { sku: "QA-BIKE-001" },
    });
    const admin = await db.adminUser.findUniqueOrThrow({
      where: { email: process.env.SEED_ADMIN_EMAIL! },
    });
    const before = product.stock;
    const checkout = await createCheckoutOrder({
      idempotencyKey: crypto.randomUUID(),
      customerName: "QA Buyer",
      phone: "+998901234567",
      email: "qa@example.com",
      region: "Toshkent",
      city: "Toshkent",
      addressLine: "Test ko‘chasi 1",
      postalCode: "100000",
      note: "Integration",
      deliveryMethod: "COURIER",
      paymentMethod: "CASH_ON_DELIVERY",
      items: [{ productId: product.id, quantity: 2 }],
    });
    const order = await db.order.findUniqueOrThrow({
      where: { orderNumber: checkout.orderNumber },
      include: { items: true },
    });
    expect(order.items[0]).toMatchObject({ sku: product.sku, quantity: 2 });
    expect(
      (await db.product.findUniqueOrThrow({ where: { id: product.id } })).stock,
    ).toBe(before - 2);
    await transitionAdminOrder({
      adminId: admin.id,
      orderId: order.id,
      toStatus: OrderStatus.CANCELLED,
      note: "QA cancellation",
    });
    await transitionAdminOrder({
      adminId: admin.id,
      orderId: order.id,
      toStatus: OrderStatus.CANCELLED,
      note: "Duplicate retry",
    });
    const cancelled = await db.order.findUniqueOrThrow({
      where: { id: order.id },
      include: { statusHistory: true },
    });
    expect(cancelled).toMatchObject({
      status: OrderStatus.CANCELLED,
      paymentStatus: PaymentStatus.CANCELLED,
      fulfillmentStatus: FulfillmentStatus.CANCELLED,
    });
    expect(
      cancelled.statusHistory.filter(
        (item) => item.toStatus === OrderStatus.CANCELLED,
      ),
    ).toHaveLength(1);
    expect(
      (await db.product.findUniqueOrThrow({ where: { id: product.id } })).stock,
    ).toBe(before);
  });
});
