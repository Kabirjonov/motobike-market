import type { Metadata } from "next";

import { WishlistPage } from "@/features/wishlist/wishlist-page";

export const metadata: Metadata = {
  title: "Sevimlilar",
  robots: { index: false, follow: true },
};

export default function Page() {
  return <WishlistPage />;
}
