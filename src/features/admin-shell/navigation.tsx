"use client";

import {
  Bike,
  Boxes,
  Gauge,
  type LucideIcon,
  PackageSearch,
  Settings,
  ShoppingCart,
  Tags,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

type NavigationItem = Readonly<{
  href: string;
  icon: LucideIcon;
  key:
    "dashboard" | "products" | "categories" | "brands" | "orders" | "settings";
}>;

export const adminNavigation: readonly NavigationItem[] = [
  {
    href: "/admin",
    icon: Gauge,
    key: "dashboard",
  },
  {
    href: "/admin/products",
    icon: PackageSearch,
    key: "products",
  },
  {
    href: "/admin/categories",
    icon: Boxes,
    key: "categories",
  },
  {
    href: "/admin/brands",
    icon: Tags,
    key: "brands",
  },
  {
    href: "/admin/orders",
    icon: ShoppingCart,
    key: "orders",
  },
  {
    href: "/admin/settings",
    icon: Settings,
    key: "settings",
  },
];

function isActiveRoute(pathname: string, href: string) {
  pathname = pathname.replace(/^\/(uz|ru|en)(?=\/|$)/, "") || "/";
  return href === "/admin"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNavigation({ className }: { className?: string }) {
  const t = useTranslations("admin.navigation");
  const pathname = usePathname();

  return (
    <nav aria-label={t("ariaLabel")} className={cn("space-y-1", className)}>
      {adminNavigation.map(({ href, icon: Icon, key }) => {
        const active = isActiveRoute(pathname, href);

        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={cn(
              "focus-visible:ring-ring flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors outline-none focus-visible:ring-2",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
            href={href}
            key={href}
          >
            <Icon aria-hidden="true" className="size-4 shrink-0" />
            <span>{t(key)}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminBrand() {
  const t = useTranslations("admin");
  return (
    <Link
      className="focus-visible:ring-ring flex items-center gap-3 rounded-lg outline-none focus-visible:ring-2"
      href="/admin"
    >
      <span className="bg-primary text-primary-foreground grid size-9 place-items-center rounded-lg">
        <Bike aria-hidden="true" className="size-5" />
      </span>
      <span>
        <span className="block text-sm font-black tracking-tight uppercase">
          Motobike
        </span>
        <span className="text-muted-foreground block text-xs">
          {t("panel")}
        </span>
      </span>
    </Link>
  );
}
