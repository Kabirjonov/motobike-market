import {
  AlertTriangle,
  BadgeDollarSign,
  Boxes,
  PackageCheck,
  ReceiptText,
  ShoppingCart,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";

import { DashboardEmptyState } from "@/features/admin-dashboard/empty-state";
import { KpiCard } from "@/features/admin-dashboard/kpi-card";
import { formatAdminDate, formatDecimalMoney } from "@/lib/formatters";
import { getAdminDashboardData } from "@/server/services/admin-dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
};

const statusStyles = {
  CANCELLED: "bg-destructive/10 text-destructive",
  COMPLETED: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  CONFIRMED: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  PENDING: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  PROCESSING: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
  SHIPPED: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400",
} as const;

export default async function AdminDashboardPage() {
  await connection();
  const data = await getAdminDashboardData();

  const kpis = [
    {
      description: "Public katalogda ko‘rinayotgan mahsulotlar",
      icon: PackageCheck,
      label: "Active products",
      value: data.kpis.activeProducts.toLocaleString("uz-UZ"),
    },
    {
      description: "Active va stock miqdori 5 yoki undan kam",
      icon: AlertTriangle,
      label: "Low stock",
      value: data.kpis.lowStockProducts.toLocaleString("uz-UZ"),
    },
    {
      description: "Oxirgi 24 soatdagi pending buyurtmalar",
      icon: ShoppingCart,
      label: "New orders",
      value: data.kpis.newOrders.toLocaleString("uz-UZ"),
    },
    {
      description: "Joriy UTC oyidagi completed buyurtmalar",
      icon: BadgeDollarSign,
      label: "Revenue",
      value: formatDecimalMoney(
        data.kpis.revenue.amount,
        data.kpis.revenue.currency,
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <header>
        <p className="text-primary text-sm font-bold tracking-[0.14em] uppercase">
          Boshqaruv markazi
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Katalog va buyurtmalarning joriy holati.
        </p>
      </header>

      <section
        aria-label="Asosiy ko‘rsatkichlar"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {kpis.map((kpi) => (
          <KpiCard {...kpi} key={kpi.label} />
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <section
          aria-labelledby="recent-orders-title"
          className="bg-card min-w-0 rounded-xl border shadow-sm"
        >
          <div className="flex items-center justify-between gap-4 border-b p-5">
            <div>
              <h2 className="font-bold" id="recent-orders-title">
                So‘nggi buyurtmalar
              </h2>
              <p className="text-muted-foreground mt-1 text-xs">
                Yaratilgan vaqt bo‘yicha oxirgi 5 ta
              </p>
            </div>
            <Link
              className="text-primary text-sm font-semibold hover:underline"
              href="/admin/orders"
            >
              Barchasi
            </Link>
          </div>

          {data.recentOrders.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-180 text-left text-sm">
                <caption className="sr-only">So‘nggi beshta buyurtma</caption>
                <thead className="text-muted-foreground">
                  <tr className="border-b">
                    <th className="px-5 py-3 font-medium" scope="col">
                      Buyurtma
                    </th>
                    <th className="px-5 py-3 font-medium" scope="col">
                      Mijoz
                    </th>
                    <th className="px-5 py-3 font-medium" scope="col">
                      Holat
                    </th>
                    <th className="px-5 py-3 font-medium" scope="col">
                      Summa
                    </th>
                    <th className="px-5 py-3 font-medium" scope="col">
                      Vaqt
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map((order) => (
                    <tr className="border-b last:border-0" key={order.id}>
                      <td className="px-5 py-4 font-semibold">
                        {order.orderNumber}
                      </td>
                      <td className="px-5 py-4">{order.customerName}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusStyles[order.status]}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-medium">
                        {formatDecimalMoney(order.total, order.currency)}
                      </td>
                      <td className="text-muted-foreground px-5 py-4">
                        <time dateTime={order.createdAt.toISOString()}>
                          {formatAdminDate(order.createdAt)}
                        </time>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-5">
              <DashboardEmptyState
                description="Buyurtmalar yaratilganda ular shu yerda ko‘rinadi."
                icon={ReceiptText}
                title="Buyurtmalar yo‘q"
              />
            </div>
          )}
        </section>

        <section
          aria-labelledby="low-stock-title"
          className="bg-card rounded-xl border shadow-sm"
        >
          <div className="flex items-center justify-between gap-4 border-b p-5">
            <div>
              <h2 className="font-bold" id="low-stock-title">
                Low stock
              </h2>
              <p className="text-muted-foreground mt-1 text-xs">
                Stock miqdori 5 yoki undan kam
              </p>
            </div>
            <Link
              className="text-primary text-sm font-semibold hover:underline"
              href="/admin/products"
            >
              Barchasi
            </Link>
          </div>

          {data.lowStockProducts.length ? (
            <ul className="divide-y">
              {data.lowStockProducts.map((product) => (
                <li
                  className="flex items-center justify-between gap-4 p-5"
                  key={product.id}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {product.name}
                    </p>
                    <p className="text-muted-foreground mt-1 truncate text-xs">
                      {product.sku}
                    </p>
                  </div>
                  <span className="bg-destructive/10 text-destructive shrink-0 rounded-full px-2.5 py-1 text-xs font-black">
                    {product.stock} dona
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-5">
              <DashboardEmptyState
                description="Barcha active mahsulotlarda yetarli stock mavjud."
                icon={Boxes}
                title="Low-stock mahsulot yo‘q"
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
