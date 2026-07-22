import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

import { ThemeToggle } from "@/components/shared/theme-toggle";
import { MiniCart } from "@/features/cart/mini-cart";
import { StoreLocaleSwitcher } from "@/features/storefront/locale";

export function PublicHeader() {
  const t = useTranslations("navigation");
  const locale = useLocale();
  return (
    <header className="border-border/70 bg-background/90 supports-[backdrop-filter]:bg-background/70 sticky top-0 z-50 border-b backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link
          className="focus-visible:ring-ring rounded-sm text-base font-black tracking-tight uppercase outline-none focus-visible:ring-2"
          href={`/${locale}`}
        >
          Motobike Market
        </Link>
        <nav aria-label={t("ariaLabel")} className="flex items-center gap-1">
          <Link
            className="hover:bg-accent focus-visible:ring-ring rounded-md px-3 py-2 text-sm font-medium outline-none focus-visible:ring-2"
            href={`/${locale}`}
          >
            {t("home")}
          </Link>
          <Link
            className="hover:bg-accent focus-visible:ring-ring rounded-md px-3 py-2 text-sm font-medium outline-none focus-visible:ring-2"
            href={`/${locale}/catalog`}
          >
            {t("catalog")}
          </Link>
          <StoreLocaleSwitcher />
          <MiniCart />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
