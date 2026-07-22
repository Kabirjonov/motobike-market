import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { Button, buttonVariants } from "@/components/ui/button";
import { OrderStatus, PaymentStatus } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";
import { adminOrderQuerySchema } from "@/schemas/admin-orders";
import { requireAdminPage } from "@/server/auth/authorization";
import { canManageOrders } from "@/server/auth/order-policy";
import { listAdminOrders } from "@/server/repositories/admin-order-repository";

export const metadata = { title: "Buyurtmalar" };
type Search = Promise<Record<string, string | string[] | undefined>>;
const one = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;
const label = (status: OrderStatus) =>
  status === OrderStatus.PENDING
    ? "NEW"
    : status === OrderStatus.COMPLETED
      ? "DELIVERED"
      : status;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  await connection();
  const admin = await requireAdminPage("/admin/orders");
  if (!canManageOrders(admin)) redirect("/admin");
  const raw = await searchParams;
  const query = adminOrderQuerySchema.parse(
    Object.fromEntries(
      Object.entries(raw).map(([key, value]) => [key, one(value)]),
    ),
  );
  const { items, page, pageCount, total } = await listAdminOrders(query);
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query))
    if (value && key !== "page") params.set(key, String(value));
  const pageHref = (next: number) => {
    const nextParams = new URLSearchParams(params);
    nextParams.set("page", String(next));
    return `/admin/orders?${nextParams}`;
  };
  return (
    <div className="grid gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-primary text-sm font-bold">Savdo</p>
          <h1 className="text-3xl font-black tracking-tight">Buyurtmalar</h1>
          <p className="text-muted-foreground mt-1">{total} ta buyurtma</p>
        </div>
        <a
          className={buttonVariants({ variant: "outline" })}
          href={`/api/admin/orders/export?${params}`}
        >
          CSV eksport
        </a>
      </header>
      <form className="bg-card border-border grid gap-3 rounded-2xl border p-4 md:grid-cols-3 xl:grid-cols-7">
        <label className="grid gap-1 text-sm font-semibold xl:col-span-2">
          Qidiruv
          <input
            className="border-input rounded-lg border px-3 py-2"
            defaultValue={query.q}
            name="q"
            placeholder="Order, telefon, mijoz…"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Status
          <select
            className="border-input rounded-lg border px-3 py-2"
            defaultValue={query.status ?? ""}
            name="status"
          >
            <option value="">Barchasi</option>
            {Object.values(OrderStatus).map((v) => (
              <option key={v} value={v}>
                {label(v)}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          To‘lov
          <select
            className="border-input rounded-lg border px-3 py-2"
            defaultValue={query.paymentStatus ?? ""}
            name="paymentStatus"
          >
            <option value="">Barchasi</option>
            {Object.values(PaymentStatus).map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Dan
          <input
            className="border-input rounded-lg border px-3 py-2"
            defaultValue={query.dateFrom}
            name="dateFrom"
            type="date"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Gacha
          <input
            className="border-input rounded-lg border px-3 py-2"
            defaultValue={query.dateTo}
            name="dateTo"
            type="date"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Saralash
          <select
            className="border-input rounded-lg border px-3 py-2"
            defaultValue={query.sort}
            name="sort"
          >
            <option value="newest">Yangi avval</option>
            <option value="oldest">Eski avval</option>
            <option value="total-desc">Jami ↓</option>
            <option value="total-asc">Jami ↑</option>
          </select>
        </label>
        <div className="flex items-end gap-2 xl:col-span-7">
          <Button type="submit">Filtrlash</Button>
          <Link
            className={buttonVariants({ variant: "ghost" })}
            href="/admin/orders"
          >
            Tozalash
          </Link>
        </div>
      </form>
      <div className="bg-card border-border overflow-hidden rounded-2xl border shadow-sm">
        {items.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="p-4">Buyurtma</th>
                  <th className="p-4">Mijoz</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">To‘lov</th>
                  <th className="p-4">Jami</th>
                  <th className="p-4">Sana</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr className="border-t" key={item.id}>
                    <td className="p-4">
                      <Link
                        className="font-bold hover:underline"
                        href={`/admin/orders/${item.id}`}
                      >
                        {item.orderNumber}
                      </Link>
                      <span className="text-muted-foreground block text-xs">
                        {item._count.items} ta pozitsiya
                      </span>
                    </td>
                    <td className="p-4">
                      {item.customerName}
                      <span className="text-muted-foreground block text-xs">
                        {item.phone}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="bg-muted rounded-full px-2 py-1 text-xs font-bold">
                        {label(item.status)}
                      </span>
                    </td>
                    <td className="p-4">{item.paymentStatus}</td>
                    <td className="p-4 tabular-nums">
                      {Number(item.total).toLocaleString("uz-UZ")}{" "}
                      {item.currency}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {item.createdAt.toLocaleDateString("uz-UZ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <h2 className="font-bold">Buyurtma topilmadi</h2>
            <p className="text-muted-foreground text-sm">
              Filtrlarni o‘zgartirib ko‘ring.
            </p>
          </div>
        )}
      </div>
      <nav aria-label="Sahifalar" className="flex items-center justify-between">
        <Link
          aria-disabled={page <= 1}
          className={cn(
            buttonVariants({ variant: "outline" }),
            page <= 1 && "pointer-events-none opacity-50",
          )}
          href={pageHref(page - 1)}
        >
          Oldingi
        </Link>
        <span className="text-muted-foreground text-sm">
          {page} / {pageCount}
        </span>
        <Link
          aria-disabled={page >= pageCount}
          className={cn(
            buttonVariants({ variant: "outline" }),
            page >= pageCount && "pointer-events-none opacity-50",
          )}
          href={pageHref(page + 1)}
        >
          Keyingi
        </Link>
      </nav>
    </div>
  );
}
