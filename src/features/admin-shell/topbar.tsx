import { ExternalLink, Menu } from "lucide-react";
import Link from "next/link";

import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { logoutAdmin } from "@/features/admin-auth/actions";
import type { AuthorizedAdmin } from "@/server/auth/authorization-policy";

import { AdminLocaleSwitcher } from "./locale-switcher";
import { AdminBrand, AdminNavigation } from "./navigation";

export function AdminTopbar({ admin }: { admin: AuthorizedAdmin }) {
  const initial = admin.name.trim().charAt(0).toUpperCase() || "A";

  return (
    <header className="border-border bg-background/95 sticky top-0 z-40 border-b backdrop-blur">
      <div className="flex min-h-18 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <details className="group relative lg:hidden">
            <summary className="focus-visible:ring-ring hover:bg-accent grid size-10 cursor-pointer list-none place-items-center rounded-md outline-none focus-visible:ring-2 [&::-webkit-details-marker]:hidden">
              <Menu aria-hidden="true" className="size-5" />
              <span className="sr-only">Admin menyuni ochish</span>
            </summary>
            <div className="border-border bg-card absolute top-12 left-0 w-[min(19rem,calc(100vw-2rem))] rounded-xl border p-4 shadow-xl">
              <AdminBrand />
              <AdminNavigation className="mt-5" />
            </div>
          </details>
          <div className="lg:hidden">
            <AdminBrand />
          </div>
          <p className="text-muted-foreground hidden text-sm xl:block">
            Admin boshqaruv markazi
          </p>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <AdminLocaleSwitcher />
          <ThemeToggle />
          <Button
            asChild
            className="hidden sm:inline-flex"
            size="sm"
            variant="ghost"
          >
            <Link href="/" target="_blank">
              Market
              <ExternalLink aria-hidden="true" className="size-4" />
            </Link>
          </Button>
          <div className="border-border ml-1 flex items-center gap-2 border-l pl-2 sm:ml-2 sm:pl-3">
            <span
              aria-hidden="true"
              className="bg-primary text-primary-foreground grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold"
            >
              {initial}
            </span>
            <span className="hidden min-w-0 md:block">
              <span className="block max-w-36 truncate text-sm font-semibold">
                {admin.name}
              </span>
              <span className="text-muted-foreground block text-xs">
                {admin.role}
              </span>
            </span>
            <form action={logoutAdmin}>
              <Button size="sm" type="submit" variant="outline">
                Chiqish
              </Button>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}
