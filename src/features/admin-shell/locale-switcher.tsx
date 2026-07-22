"use client";

import { Languages } from "lucide-react";

import { StoreLocaleSwitcher } from "@/features/storefront/locale";

export function AdminLocaleSwitcher() {
  return (
    <div className="flex items-center gap-1">
      <Languages aria-hidden="true" className="text-muted-foreground size-4" />
      <StoreLocaleSwitcher />
    </div>
  );
}
