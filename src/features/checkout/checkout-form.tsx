"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { calculateStoredCartSubtotal } from "@/features/cart/cart-summary";
import { formatDecimalMoney } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";

const control =
  "border-input bg-background min-h-11 w-full rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";
export function CheckoutForm() {
  const items = useCartStore((state) => state.items);
  const clear = useCartStore((state) => state.clear);
  const router = useRouter();
  const key = useRef("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [delivery, setDelivery] = useState<"COURIER" | "PICKUP">("COURIER");
  if (!items.length)
    return (
      <div className="container grid min-h-[65vh] place-items-center text-center">
        <div>
          <h1 className="text-3xl font-black">Checkout uchun savat bo‘sh</h1>
          <Link className={cn(buttonVariants(), "mt-5")} href="/catalog">
            Katalogga qaytish
          </Link>
        </div>
      </div>
    );
  const subtotal = calculateStoredCartSubtotal(items);
  const deliveryFee = delivery === "COURIER" ? "25000.00" : "0.00";
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    if (!key.current) key.current = crypto.randomUUID();
    const data = new FormData(event.currentTarget);
    const payload = {
      idempotencyKey: key.current,
      customerName: data.get("customerName"),
      phone: data.get("phone"),
      email: data.get("email"),
      region: data.get("region"),
      city: data.get("city"),
      addressLine: data.get("addressLine"),
      postalCode: data.get("postalCode"),
      note: data.get("note"),
      deliveryMethod: data.get("deliveryMethod"),
      paymentMethod: "CASH_ON_DELIVERY",
      items: items.map(({ productId, quantity }) => ({ productId, quantity })),
    };
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await response.json()) as {
        data?: { orderNumber: string };
        error?: { message: string };
      };
      if (!response.ok || !body.data) {
        setError(body.error?.message ?? "Buyurtma yaratilmadi");
        return;
      }
      clear();
      router.push(`/order-success/${body.data.orderNumber}`);
    } catch {
      setError("Server bilan aloqa uzildi. Qayta urinib ko‘ring.");
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="container py-10">
      <header>
        <h1 className="text-4xl font-black">Guest checkout</h1>
        <p className="text-muted-foreground mt-2">
          Akkaunt yaratish talab qilinmaydi.
        </p>
      </header>
      <form
        className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_24rem]"
        onSubmit={submit}
      >
        <div className="grid gap-6">
          <fieldset className="bg-card grid gap-4 rounded-2xl border p-5">
            <legend className="px-2 text-lg font-black">Kontakt</legend>
            <label className="grid gap-1 text-sm font-bold">
              Ism
              <input className={control} name="customerName" required />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1 text-sm font-bold">
                Telefon
                <input
                  className={control}
                  name="phone"
                  pattern="\+998[0-9 ()-]{9,}"
                  placeholder="+998 90 123 45 67"
                  required
                  type="tel"
                />
              </label>
              <label className="grid gap-1 text-sm font-bold">
                Email (ixtiyoriy)
                <input className={control} name="email" type="email" />
              </label>
            </div>
          </fieldset>
          <fieldset className="bg-card grid gap-4 rounded-2xl border p-5">
            <legend className="px-2 text-lg font-black">Yetkazish</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1 text-sm font-bold">
                Viloyat
                <input className={control} name="region" required />
              </label>
              <label className="grid gap-1 text-sm font-bold">
                Shahar
                <input className={control} name="city" required />
              </label>
            </div>
            <label className="grid gap-1 text-sm font-bold">
              Manzil
              <input className={control} name="addressLine" required />
            </label>
            <label className="grid gap-1 text-sm font-bold">
              Pochta indeksi
              <input className={control} name="postalCode" />
            </label>
            <label className="grid gap-1 text-sm font-bold">
              Izoh
              <textarea className={control} name="note" rows={4} />
            </label>
            <label className="grid gap-1 text-sm font-bold">
              Yetkazish usuli
              <select
                className={control}
                name="deliveryMethod"
                onChange={(event) =>
                  setDelivery(event.target.value as "COURIER" | "PICKUP")
                }
                value={delivery}
              >
                <option value="COURIER">Kuryer — 25 000 UZS</option>
                <option value="PICKUP">Olib ketish — bepul</option>
              </select>
            </label>
          </fieldset>
          <fieldset className="bg-card rounded-2xl border p-5">
            <legend className="px-2 text-lg font-black">To‘lov</legend>
            <label className="flex items-start gap-3">
              <input
                defaultChecked
                name="payment"
                type="radio"
                value="CASH_ON_DELIVERY"
              />
              <span>
                <strong className="block">Yetkazilganda naqd to‘lov</strong>
                <span className="text-muted-foreground text-sm">
                  Buyurtma hozir “paid” deb belgilanmaydi.
                </span>
              </span>
            </label>
          </fieldset>
        </div>
        <aside className="bg-card sticky top-24 rounded-2xl border p-5">
          <h2 className="text-xl font-black">Buyurtma</h2>
          <ul className="mt-4 grid gap-2 text-sm">
            {items.map((item) => (
              <li className="flex justify-between gap-3" key={item.productId}>
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>{formatDecimalMoney(item.price, "UZS")}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-5 grid gap-2 border-t pt-4 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{formatDecimalMoney(subtotal, "UZS")}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Yetkazish</dt>
              <dd>{formatDecimalMoney(deliveryFee, "UZS")}</dd>
            </div>
          </dl>
          {error ? (
            <p
              aria-live="assertive"
              className="text-destructive mt-4 text-sm font-bold"
            >
              {error}
            </p>
          ) : null}
          <Button
            className="mt-5 w-full"
            disabled={pending}
            size="lg"
            type="submit"
          >
            {pending ? "Yaratilmoqda…" : "Buyurtma berish"}
          </Button>
          <p className="text-muted-foreground mt-3 text-xs">
            Server yakuniy narx va stockni qayta tekshiradi.
          </p>
        </aside>
      </form>
    </div>
  );
}
