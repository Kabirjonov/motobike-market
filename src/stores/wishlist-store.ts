"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type WishlistItem = {
  currency: string;
  imageAlt: string;
  imageUrl?: string;
  name: string;
  price: string;
  productId: string;
  sku: string;
  slug: string;
  stock: number;
};

type WishlistState = {
  items: WishlistItem[];
  removeItem(productId: string): void;
  toggleItem(item: WishlistItem): void;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set) => ({
      items: [],
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        })),
      toggleItem: (item) =>
        set((state) => {
          const exists = state.items.some(
            (entry) => entry.productId === item.productId,
          );
          return {
            items: exists
              ? state.items.filter(
                  (entry) => entry.productId !== item.productId,
                )
              : [...state.items, item],
          };
        }),
    }),
    {
      name: "motobike-wishlist",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
