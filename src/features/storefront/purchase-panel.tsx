"use client";

import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";

type Props = {
  imageUrl?: string;
  name: string;
  price: string;
  productId: string;
  sku: string;
  stock: number;
};
export function PurchasePanel(props: Props) {
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const addItem = useCartStore((state) => state.addItem);
  const unavailable = props.stock <= 0;
  function add() {
    if (unavailable) return;
    addItem({ ...props, quantity });
    setMessage(`${quantity} dona savatga qo‘shildi.`);
  }
  const controls = (
    <>
      <div className="flex h-11 items-center rounded-lg border">
        <button
          aria-label="Miqdorni kamaytirish"
          className="grid size-10 place-items-center"
          disabled={quantity <= 1}
          onClick={() => setQuantity((value) => Math.max(1, value - 1))}
          type="button"
        >
          <Minus className="size-4" />
        </button>
        <output aria-label="Miqdor" className="w-10 text-center font-bold">
          {quantity}
        </output>
        <button
          aria-label="Miqdorni oshirish"
          className="grid size-10 place-items-center"
          disabled={quantity >= props.stock}
          onClick={() =>
            setQuantity((value) => Math.min(props.stock, value + 1))
          }
          type="button"
        >
          <Plus className="size-4" />
        </button>
      </div>
      <Button
        className="flex-1"
        disabled={unavailable}
        onClick={add}
        size="lg"
        type="button"
      >
        <ShoppingCart className="size-4" />
        {unavailable ? "Sotuvda yo‘q" : "Savatga qo‘shish"}
      </Button>
    </>
  );
  return (
    <>
      <div className="grid gap-3">
        <div className="hidden gap-3 lg:flex">{controls}</div>
        <p
          aria-live="polite"
          className="text-primary min-h-5 text-sm font-semibold"
        >
          {message}
        </p>
      </div>
      <div className="bg-background/95 border-border fixed inset-x-0 bottom-0 z-40 flex gap-3 border-t p-3 backdrop-blur lg:hidden">
        {controls}
      </div>
    </>
  );
}
