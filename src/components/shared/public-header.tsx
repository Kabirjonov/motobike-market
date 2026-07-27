import { Heart, Menu, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";

import { MiniCart } from "@/features/cart/mini-cart";

export function PublicHeader() {
  const locale = useLocale();
  return (
    <header className="relative z-50 bg-[#0c0e10] text-white">
      <div className="container flex h-[60px] items-center gap-4 lg:gap-5">
        <Link className="shrink-0" href={`/${locale}`}>
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
          href={`/${locale}/catalog`}
        >
          <Menu className="size-5" /> Katalog
        </Link>
        <form
          action={`/${locale}/catalog`}
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
            {(["uz", "ru", "en"] as const).map((item) => (
              <Link
                className={
                  item === locale
                    ? "border-b-2 border-red-600 py-2 text-white"
                    : "py-2 text-white/55 hover:text-white"
                }
                href={`/${item}`}
                key={item}
              >
                {item.toUpperCase()}
              </Link>
            ))}
          </div>
          <Link
            className="hidden items-center gap-2 text-xs text-white/80 hover:text-white sm:flex"
            href={`/${locale}/catalog`}
          >
            <Heart className="size-5" /> Sevimlilar
          </Link>
          <MiniCart />
        </nav>
      </div>
      <nav className="border-t border-white/5 bg-[#171a1d]">
        <div className="container flex h-10 items-center gap-7 overflow-x-auto text-xs whitespace-nowrap text-white/80">
          <Link href={`/${locale}/catalog?type=MOTORCYCLE`}>Mototsikllar</Link>
          <Link href={`/${locale}/catalog?type=PART`}>Ehtiyot qismlar</Link>
          <Link href={`/${locale}/catalog?type=ACCESSORY`}>Aksessuarlar</Link>
          <Link href={`/${locale}/catalog?type=GEAR`}>Himoya jihozlari</Link>
          <Link href={`/${locale}/catalog`}>Katalogni ko‘rish</Link>
        </div>
      </nav>
    </header>
  );
}
