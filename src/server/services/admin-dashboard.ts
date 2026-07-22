import "server-only";

import { Locale, OrderStatus, ProductStatus } from "@/generated/prisma/enums";
import { getPrismaClient } from "@/server/db/client";

const DASHBOARD_CURRENCY = "UZS";
const LOW_STOCK_LIMIT = 5;

export type AdminDashboardData = Readonly<{
  kpis: {
    activeProducts: number;
    lowStockProducts: number;
    newOrders: number;
    revenue: { amount: string; currency: string };
  };
  lowStockProducts: readonly {
    id: string;
    name: string;
    sku: string;
    stock: number;
  }[];
  recentOrders: readonly {
    createdAt: Date;
    currency: string;
    customerName: string;
    id: string;
    orderNumber: string;
    status: OrderStatus;
    total: string;
  }[];
}>;

export function getDashboardPeriods(now = new Date()) {
  return {
    last24Hours: new Date(now.getTime() - 24 * 60 * 60 * 1000),
    monthStart: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)),
  };
}

export async function getAdminDashboardData(
  now = new Date(),
): Promise<AdminDashboardData> {
  const db = getPrismaClient();
  const { last24Hours, monthStart } = getDashboardPeriods(now);

  const [
    activeProducts,
    lowStockProductsCount,
    newOrders,
    revenue,
    recentOrders,
    lowStockProducts,
  ] = await Promise.all([
    db.product.count({
      where: { archivedAt: null, status: ProductStatus.ACTIVE },
    }),
    db.product.count({
      where: {
        archivedAt: null,
        status: ProductStatus.ACTIVE,
        stock: { lte: LOW_STOCK_LIMIT },
      },
    }),
    db.order.count({
      where: {
        createdAt: { gte: last24Hours },
        status: OrderStatus.PENDING,
      },
    }),
    db.order.aggregate({
      _sum: { total: true },
      where: {
        createdAt: { gte: monthStart },
        currency: DASHBOARD_CURRENCY,
        status: OrderStatus.COMPLETED,
      },
    }),
    db.order.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        createdAt: true,
        currency: true,
        customerName: true,
        id: true,
        orderNumber: true,
        status: true,
        total: true,
      },
      take: 5,
    }),
    db.product.findMany({
      orderBy: [{ stock: "asc" }, { updatedAt: "desc" }],
      select: {
        id: true,
        sku: true,
        stock: true,
        translations: {
          select: { name: true },
          take: 1,
          where: { locale: Locale.UZ },
        },
      },
      take: 5,
      where: {
        archivedAt: null,
        status: ProductStatus.ACTIVE,
        stock: { lte: LOW_STOCK_LIMIT },
      },
    }),
  ]);

  return {
    kpis: {
      activeProducts,
      lowStockProducts: lowStockProductsCount,
      newOrders,
      revenue: {
        amount: revenue._sum.total?.toFixed(2) ?? "0.00",
        currency: DASHBOARD_CURRENCY,
      },
    },
    lowStockProducts: lowStockProducts.map((product) => ({
      id: product.id,
      name: product.translations[0]?.name ?? product.sku,
      sku: product.sku,
      stock: product.stock,
    })),
    recentOrders: recentOrders.map((order) => ({
      ...order,
      total: order.total.toFixed(2),
    })),
  };
}
