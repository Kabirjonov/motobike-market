"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type CartItem = {
  imageUrl?: string;
  name: string;
  price: string;
  productId: string;
  quantity: number;
  sku: string;
  stock: number;
};
export function clampCartQuantity(quantity: number, stock: number) {
  if (stock <= 0) return 0;
  return Math.max(1, Math.min(Math.trunc(quantity), stock));
}
type CartState = {
  items: CartItem[];
  addItem(item: CartItem): void;
  removeItem(productId: string): void;
  setQuantity(productId: string, quantity: number): void;
  clear(): void;
};
export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      clear: () => set({ items: [] }),
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (entry) => entry.productId === item.productId,
          );
          if (!existing)
            return {
              items: [
                ...state.items,
                {
                  ...item,
                  quantity: clampCartQuantity(item.quantity, item.stock),
                },
              ],
            };
          return {
            items: state.items.map((entry) =>
              entry.productId === item.productId
                ? {
                    ...entry,
                    quantity: clampCartQuantity(
                      entry.quantity + item.quantity,
                      item.stock,
                    ),
                    stock: item.stock,
                  }
                : entry,
            ),
          };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        })),
      setQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId
              ? {
                  ...item,
                  quantity: clampCartQuantity(quantity, item.stock),
                }
              : item,
          ),
        })),
    }),
    {
      name: "motobike-cart",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
