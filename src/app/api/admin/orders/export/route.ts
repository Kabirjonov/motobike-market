import { adminOrderQuerySchema } from "@/schemas/admin-orders";
import { requireAdminApi } from "@/server/auth/authorization";
import { canManageOrders } from "@/server/auth/order-policy";
import { rowsToCsv } from "@/server/orders/csv";
import { listOrdersForExport } from "@/server/repositories/admin-order-repository";

export async function GET(request: Request) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;
  if (!canManageOrders(auth.admin))
    return Response.json(
      { error: { code: "FORBIDDEN", message: "Order manager role required" } },
      { status: 403 },
    );
  const query = adminOrderQuerySchema.parse(
    Object.fromEntries(new URL(request.url).searchParams),
  );
  const orders = await listOrdersForExport(query);
  const csv = rowsToCsv([
    [
      "Order number",
      "Created at",
      "Customer",
      "Phone",
      "Email",
      "Order status",
      "Payment status",
      "Delivery",
      "Total",
      "Currency",
    ],
    ...orders.map((order) => [
      order.orderNumber,
      order.createdAt.toISOString(),
      order.customerName,
      order.phone,
      order.email,
      order.status,
      order.paymentStatus,
      order.deliveryMethod,
      order.total.toString(),
      order.currency,
    ]),
  ]);
  return new Response(csv, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": `attachment; filename="orders-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Content-Type": "text/csv; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
