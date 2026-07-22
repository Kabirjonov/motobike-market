import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { z } from "zod";

import { buttonVariants } from "@/components/ui/button";
import { formatDecimalMoney } from "@/lib/formatters";
import { getPublicOrderReceipt } from "@/server/repositories/public-order-receipt";
export const metadata: Metadata = {
  title: "Buyurtma qabul qilindi",
  robots: { index: false, follow: false },
};
const referenceSchema = z.string().regex(/^MB-[A-F0-9]{24}$/);
export default async function OrderSuccess({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  await connection();
  const parsed = referenceSchema.safeParse((await params).orderNumber);
  if (!parsed.success) notFound();
  const order = await getPublicOrderReceipt(parsed.data);
  if (!order) notFound();
  return (
    <div className="container grid min-h-[70vh] place-items-center py-12">
      <div className="bg-card max-w-xl rounded-3xl border p-8 text-center shadow-sm sm:p-12">
        <p className="text-primary text-sm font-black uppercase">
          Buyurtma qabul qilindi
        </p>
        <h1 className="mt-3 text-3xl font-black">Rahmat!</h1>
        <p className="text-muted-foreground mt-3">
          Admin buyurtmani tekshirib, siz bilan bog‘lanadi.
        </p>
        <dl className="mt-7 grid gap-3 rounded-xl border p-4 text-left">
          <div className="flex justify-between">
            <dt>Reference</dt>
            <dd className="font-mono font-bold">{order.orderNumber}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Status</dt>
            <dd className="font-bold">{order.status}</dd>
          </div>
          <div className="flex justify-between">
            <dt>To‘lov</dt>
            <dd className="font-bold">{order.paymentStatus}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Jami</dt>
            <dd className="font-bold">
              {formatDecimalMoney(order.total, order.currency)}
            </dd>
          </div>
        </dl>
        <p className="text-muted-foreground mt-4 text-xs">
          Bu reference’ni saqlab qo‘ying. Sahifada shaxsiy ma’lumot
          ko‘rsatilmaydi.
        </p>
        <Link className={`${buttonVariants()} mt-7`} href="/catalog">
          Katalogga qaytish
        </Link>
      </div>
    </div>
  );
}
