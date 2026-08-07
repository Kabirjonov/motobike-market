"use client";

import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

import { adminNavigation } from "./navigation";

export function AdminBreadcrumbs() {
  const t = useTranslations("admin.navigation");
  const rawPathname = usePathname();
  const pathname = rawPathname.replace(/^\/(uz|ru|en)(?=\/|$)/, "") || "/";
  const current = [...adminNavigation]
    .sort((a, b) => b.href.length - a.href.length)
    .find(
      ({ href }) =>
        pathname === href ||
        (href !== "/admin" && pathname.startsWith(`${href}/`)),
    );
  if (!current || pathname === "/admin") return null;
  return (
    <nav aria-label="Breadcrumb" className="mb-5">
      <ol className="text-muted-foreground flex items-center gap-2 text-sm">
        <li>
          <Link
            aria-label={t("dashboard")}
            className="hover:text-foreground focus-visible:ring-ring rounded-sm outline-none focus-visible:ring-2"
            href="/admin"
          >
            <Home aria-hidden="true" className="size-4" />
          </Link>
        </li>
        <li aria-hidden="true">
          <ChevronRight className="size-4" />
        </li>
        <li aria-current="page" className="text-foreground font-medium">
          {t(current.key)}
        </li>
      </ol>
    </nav>
  );
}
