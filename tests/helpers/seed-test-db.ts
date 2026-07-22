import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "argon2";

import { PrismaClient } from "../../src/generated/prisma/client";
import {
  AdminRole,
  Locale,
  ProductCondition,
  ProductStatus,
  ProductType,
} from "../../src/generated/prisma/enums";

const url = process.env.DATABASE_URL!;
if (!new URL(url).pathname.slice(1).endsWith("_test"))
  throw new Error("Refusing to seed a non-test database");
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: url }),
});

async function main() {
  await db.$transaction([
    db.orderStatusHistory.deleteMany(),
    db.orderItem.deleteMany(),
    db.order.deleteMany(),
    db.productCompatibility.deleteMany(),
    db.productImage.deleteMany(),
    db.motorcycleSpec.deleteMany(),
    db.partSpec.deleteMany(),
    db.productTranslation.deleteMany(),
    db.product.deleteMany(),
    db.categoryTranslation.deleteMany(),
    db.category.deleteMany(),
    db.brand.deleteMany(),
    db.adminAuditLog.deleteMany(),
    db.adminSession.deleteMany(),
    db.authRateLimit.deleteMany(),
    db.adminUser.deleteMany(),
    db.redirect.deleteMany(),
    db.siteSetting.deleteMany(),
  ]);
  const admin = await db.adminUser.create({
    data: {
      email: process.env.SEED_ADMIN_EMAIL!,
      passwordHash: await hash(process.env.SEED_ADMIN_PASSWORD!),
      name: "QA Admin",
      role: AdminRole.SUPER_ADMIN,
    },
  });
  const category = await db.category.create({
    data: {
      sortOrder: 1,
      translations: {
        create: [
          {
            locale: Locale.UZ,
            name: "Test mototsikllar",
            slug: "test-mototsikllar",
            description: "QA katalog",
          },
          {
            locale: Locale.RU,
            name: "Тестовые мотоциклы",
            slug: "test-motocikly",
            description: "QA каталог",
          },
          {
            locale: Locale.EN,
            name: "Test motorcycles",
            slug: "test-motorcycles",
            description: "QA catalog",
          },
        ],
      },
    },
  });
  const brand = await db.brand.create({
    data: { name: "QA Motors", slug: "qa-motors" },
  });
  const product = await db.product.create({
    data: {
      sku: "QA-BIKE-001",
      type: ProductType.MOTORCYCLE,
      status: ProductStatus.ACTIVE,
      condition: ProductCondition.NEW,
      categoryId: category.id,
      brandId: brand.id,
      price: "12500000.00",
      stock: 20,
      currency: "UZS",
      isFeatured: true,
      translations: {
        create: [
          {
            locale: Locale.UZ,
            name: "QA Test Mototsikl",
            slug: "qa-test-mototsikl",
            description: "Deterministik test mahsuloti",
          },
          {
            locale: Locale.RU,
            name: "QA Тестовый мотоцикл",
            slug: "qa-test-motocikl",
            description: "Детерминированный тестовый товар",
          },
          {
            locale: Locale.EN,
            name: "QA Test Motorcycle",
            slug: "qa-test-motorcycle",
            description: "Deterministic test product",
          },
        ],
      },
      motorcycleSpec: {
        create: {
          make: "QA",
          model: "One",
          year: 2026,
          engineCc: 500,
          mileageKm: 0,
        },
      },
    },
  });
  await db.order.create({
    data: {
      orderNumber: "QA-E2E-ORDER",
      customerName: "QA Customer",
      phone: "+998909998877",
      region: "Toshkent",
      city: "Toshkent",
      addressLine: "QA street 1",
      subtotal: "12500000.00",
      deliveryFee: "25000.00",
      total: "12525000.00",
      currency: "UZS",
      items: {
        create: {
          productId: product.id,
          productType: ProductType.MOTORCYCLE,
          name: "QA Test Mototsikl",
          sku: product.sku,
          slug: "qa-test-mototsikl",
          unitPrice: "12500000.00",
          quantity: 1,
          lineTotal: "12500000.00",
        },
      },
      statusHistory: {
        create: { toStatus: "PENDING", note: "Deterministic E2E fixture" },
      },
    },
  });
  console.info(
    JSON.stringify({ seeded: true, adminId: admin.id, productId: product.id }),
  );
}

main().finally(() => db.$disconnect());
