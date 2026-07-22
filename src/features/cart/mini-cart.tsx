"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";

import { formatDecimalMoney } from "@/lib/formatters";
import { useCartStore } from "@/stores/cart-store";

import { calculateStoredCartSubtotal } from "./cart-summary";

export function MiniCart() {
  const items = useCartStore((state) => state.items);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <details className="group relative">
      <summary
        aria-label={`Savat, ${count} mahsulot`}
        className="hover:bg-accent focus-visible:ring-ring relative grid size-10 cursor-pointer list-none place-items-center rounded-md outline-none focus-visible:ring-2"
      >
        <ShoppingCart className="size-5" />
        <span className="bg-primary text-primary-foreground absolute -top-1 -right-1 min-w-5 rounded-full px-1 text-center text-[10px] font-black">
          {count}
        </span>
      </summary>
      <div className="bg-popover border-border absolute top-12 right-0 z-50 w-72 rounded-xl border p-4 shadow-xl">
        <h2 className="font-black">Mini savat</h2>
        {items.length ? (
          <>
            <ul className="mt-3 grid max-h-64 gap-2 overflow-auto text-sm">
              {items.map((item) => (
                <li className="flex justify-between gap-3" key={item.productId}>
                  <span className="line-clamp-1">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="shrink-0 font-bold">
                    {formatDecimalMoney(item.price, "UZS")}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex justify-between border-t pt-3 text-sm">
              <span>Subtotal</span>
              <strong>
                {formatDecimalMoney(calculateStoredCartSubtotal(items), "UZS")}
              </strong>
            </div>
          </>
        ) : (
          <p className="text-muted-foreground mt-3 text-sm">Savat bo‘sh.</p>
        )}
        <Link
          className="bg-primary text-primary-foreground mt-4 block rounded-lg px-3 py-2 text-center text-sm font-bold"
          href="/cart"
        >
          Savatni ochish
        </Link>
      </div>
    </details>
  );
}
