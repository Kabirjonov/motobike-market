import "server-only";

import { Prisma } from "@/generated/prisma/client";
import type { AdminOrderQuery } from "@/schemas/admin-orders";
import { getPrismaClient } from "@/server/db/client";

export function buildAdminOrderWhere(
  query: AdminOrderQuery,
): Prisma.OrderWhereInput {
  const createdAt =
    query.dateFrom || query.dateTo
      ? {
          ...(query.dateFrom
            ? { gte: new Date(`${query.dateFrom}T00:00:00.000Z`) }
            : {}),
          ...(query.dateTo
            ? {
                lt: new Date(
                  new Date(`${query.dateTo}T00:00:00.000Z`).getTime() +
                    86_400_000,
                ),
              }
            : {}),
        }
      : undefined;
  return {
    status: query.status,
    paymentStatus: query.paymentStatus,
    createdAt,
    ...(query.q
      ? {
          OR: [
            { orderNumber: { contains: query.q, mode: "insensitive" } },
            { phone: { contains: query.q, mode: "insensitive" } },
            { customerName: { contains: query.q, mode: "insensitive" } },
          ],
        }
      : {}),
  };
}

function orderBy(
  sort: AdminOrderQuery["sort"],
): Prisma.OrderOrderByWithRelationInput {
  if (sort === "oldest") return { createdAt: "asc" };
  if (sort === "total-asc") return { total: "asc" };
  if (sort === "total-desc") return { total: "desc" };
  return { createdAt: "desc" };
}

export async function listAdminOrders(query: AdminOrderQuery) {
  const db = getPrismaClient();
  const where = buildAdminOrderWhere(query);
  const pageSize = 15;
  const [items, total] = await Promise.all([
    db.order.findMany({
      orderBy: orderBy(query.sort),
      skip: (query.page - 1) * pageSize,
      take: pageSize,
      where,
      include: { _count: { select: { items: true } } },
    }),
    db.order.count({ where }),
  ]);
  return {
    items,
    page: query.page,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
    total,
  };
}

export function getAdminOrder(id: string) {
  return getPrismaClient().order.findUnique({
    where: { id },
    include: {
      items: { orderBy: { createdAt: "asc" } },
      statusHistory: {
        orderBy: { createdAt: "asc" },
        include: { actorAdminUser: { select: { name: true, email: true } } },
      },
    },
  });
}

export function listOrdersForExport(query: AdminOrderQuery) {
  return getPrismaClient().order.findMany({
    where: buildAdminOrderWhere(query),
    orderBy: orderBy(query.sort),
    take: 10_000,
  });
}
