import { Menu, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { MiniCart } from "@/features/cart/mini-cart";
import { StoreLocaleSwitcher } from "@/features/storefront/locale";
import { WishlistNavLink } from "@/features/wishlist/wishlist-nav-link";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 bg-[#0c0e10]/95 text-white shadow-[0_8px_24px_rgba(0,0,0,0.28)] backdrop-blur-md">
      <div className="container flex h-[60px] items-center gap-4 lg:gap-5">
        <Link className="shrink-0" href="/">
          <Image
            alt="Moto Market"
            className="h-auto w-[165px] sm:w-[205px]"
            height={50}
            priority
            src="/moto-market-logo-horizontal.png"
            width={230}
          />
        </Link>
        <Link
          className="ml-auto hidden h-10 items-center gap-2 rounded-md bg-red-600 px-4 text-sm font-bold hover:bg-red-500 md:flex lg:ml-8"
          href="/catalog"
        >
          <Menu className="size-5" /> Katalog
        </Link>
        <form
          action="/catalog"
          className="hidden h-10 min-w-0 flex-1 items-center overflow-hidden rounded-md border border-white/15 bg-white/5 lg:flex"
        >
          <input
            aria-label="Qidiruv"
            className="h-full min-w-0 flex-1 bg-transparent px-4 text-xs text-white outline-none placeholder:text-white/35"
            name="q"
            placeholder="Qidiruv: mototsikl, ehtiyot qism, brend..."
          />
          <button
            aria-label="Qidirish"
            className="grid size-10 place-items-center"
            type="submit"
          >
            <Search className="size-5" />
          </button>
        </form>
        <nav className="ml-auto flex items-center gap-2 sm:gap-4">
          <div className="hidden items-center gap-3 border-r border-white/10 pr-4 text-[11px] sm:flex">
            <StoreLocaleSwitcher variant="compact" />
          </div>
          <WishlistNavLink />
          <MiniCart />
        </nav>
      </div>
      <nav className="border-t border-white/5 bg-[#171a1d]">
        <div className="container flex h-10 items-center gap-7 overflow-x-auto text-xs whitespace-nowrap text-white/80">
          <Link href="/catalog?type=MOTORCYCLE">Mototsikllar</Link>
          <Link href="/catalog?type=PART">Ehtiyot qismlar</Link>
          <Link href="/catalog?type=ACCESSORY">Aksessuarlar</Link>
          <Link href="/catalog?type=GEAR">Himoya jihozlari</Link>
          <Link href="/catalog">Katalogni ko‘rish</Link>
        </div>
      </nav>
    </header>
  );
}
