"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { useSyncExternalStore } from "react";

import { useWishlistStore } from "@/stores/wishlist-store";

export function WishlistNavLink() {
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const count = useWishlistStore((state) => state.items.length);

  return (
    <Link
      className="relative hidden items-center gap-2 text-xs text-white/80 hover:text-white sm:flex"
      href="/liked"
    >
      <Heart className="size-5" />
      Sevimlilar
      {mounted && count > 0 ? (
        <span className="absolute -top-3 -left-1 grid size-4 place-items-center rounded-full bg-red-600 text-[9px] font-black text-white">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}
