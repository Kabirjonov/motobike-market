import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";

import { buttonVariants } from "@/components/ui/button";
import { TransitionForm } from "@/features/admin-orders/transition-form";
import { OrderStatus } from "@/generated/prisma/enums";
import { requireAdminPage } from "@/server/auth/authorization";
import { canManageOrders } from "@/server/auth/order-policy";
import { safeEmailHref, safePhoneHref } from "@/server/orders/csv";
import { getAdminOrder } from "@/server/repositories/admin-order-repository";
import { getAllowedOrderTransitions } from "@/server/services/order-status";

export const metadata = { title: "Buyurtma tafsiloti" };
const statusLabel = (status: OrderStatus) =>
  status === OrderStatus.PENDING
    ? "NEW"
    : status === OrderStatus.COMPLETED
      ? "DELIVERED"
      : status;

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const admin = await requireAdminPage("/admin/orders");
  if (!canManageOrders(admin)) redirect("/admin");
  const order = await getAdminOrder((await params).id);
  if (!order) notFound();
  const phoneHref = safePhoneHref(order.phone);
  const emailHref = safeEmailHref(order.email);
  return (
    <div className="grid gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-primary text-sm font-bold">
            {statusLabel(order.status)} · {order.paymentStatus}
          </p>
          <h1 className="text-3xl font-black tracking-tight">
            {order.orderNumber}
          </h1>
          <p className="text-muted-foreground mt-1">
            {order.createdAt.toLocaleString("uz-UZ")}
          </p>
        </div>
        <Link
          className={buttonVariants({ variant: "outline" })}
          href="/admin/orders"
        >
          Ro‘yxatga qaytish
        </Link>
      </header>
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="bg-card border-border rounded-2xl border p-5 lg:col-span-2">
          <h2 className="text-xl font-bold">Mahsulot snapshotlari</h2>
          <div className="mt-4 grid gap-3">
            {order.items.map((item) => (
              <article
                className="border-border flex justify-between gap-4 border-b pb-3"
                key={item.id}
              >
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-muted-foreground text-sm">
                    {item.sku} · {item.productType} · {item.quantity} dona
                  </p>
                </div>
                <p className="font-bold tabular-nums">
                  {Number(item.lineTotal).toLocaleString("uz-UZ")}{" "}
                  {order.currency}
                </p>
              </article>
            ))}
          </div>
          <dl className="mt-5 ml-auto grid max-w-sm grid-cols-2 gap-2 text-sm">
            <dt>Subtotal</dt>
            <dd className="text-right">
              {Number(order.subtotal).toLocaleString("uz-UZ")} {order.currency}
            </dd>
            <dt>Yetkazish</dt>
            <dd className="text-right">
              {Number(order.deliveryFee).toLocaleString("uz-UZ")}{" "}
              {order.currency}
            </dd>
            <dt className="font-bold">Jami</dt>
            <dd className="text-right font-bold">
              {Number(order.total).toLocaleString("uz-UZ")} {order.currency}
            </dd>
          </dl>
        </section>
        <aside className="grid content-start gap-6">
          <section className="bg-card border-border rounded-2xl border p-5">
            <h2 className="font-bold">Mijoz va yetkazish</h2>
            <p className="mt-3 font-semibold">{order.customerName}</p>
            {phoneHref ? (
              <a
                className="text-primary block hover:underline"
                href={phoneHref}
              >
                {order.phone}
              </a>
            ) : (
              <span>{order.phone}</span>
            )}
            {emailHref ? (
              <a
                className="text-primary block break-all hover:underline"
                href={emailHref}
              >
                {order.email}
              </a>
            ) : null}
            <address className="text-muted-foreground mt-3 not-italic">
              {order.region}, {order.city}
              <br />
              {order.addressLine}
              {order.postalCode ? (
                <>
                  <br />
                  {order.postalCode}
                </>
              ) : null}
            </address>
            <p className="mt-3 text-sm">
              <b>Usul:</b> {order.deliveryMethod}
            </p>
            <p className="mt-2 text-sm">
              <b>Izoh:</b> {order.note || "—"}
            </p>
          </section>
          <section className="bg-card border-border rounded-2xl border p-5">
            <h2 className="mb-3 font-bold">Statusni yangilash</h2>
            <TransitionForm
              orderId={order.id}
              transitions={getAllowedOrderTransitions(order.status)}
            />
          </section>
        </aside>
      </div>
      <section className="bg-card border-border rounded-2xl border p-5">
        <h2 className="text-xl font-bold">Audit timeline</h2>
        <ol className="mt-4 grid gap-4">
          {order.statusHistory.map((event) => (
            <li className="border-l-primary border-l-2 pl-4" key={event.id}>
              <p className="font-semibold">
                {event.fromStatus ? `${statusLabel(event.fromStatus)} → ` : ""}
                {statusLabel(event.toStatus)}
              </p>
              <p className="text-muted-foreground text-sm">
                {event.createdAt.toLocaleString("uz-UZ")} ·{" "}
                {event.actorAdminUser?.name ?? "System"}
              </p>
              {event.note ? <p className="mt-1 text-sm">{event.note}</p> : null}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
