"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";

import { type AppLocale, localePath } from "@/i18n/routing";

export function StoreLocaleSwitcher({
  localizedPaths,
}: {
  localizedPaths?: Partial<Record<AppLocale, string>>;
}) {
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const t = useTranslations("locale");
  function update(next: AppLocale) {
    localStorage.setItem("locale", next);
    document.cookie = `NEXT_LOCALE=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
    startTransition(() =>
      router.replace(localizedPaths?.[next] ?? localePath(next, pathname)),
    );
  }
  return (
    <label>
      <span className="sr-only">{t("label")}</span>
      <select
        aria-label={t("label")}
        className="border-input bg-background ml-2 rounded-md border px-2 py-2 text-sm"
        disabled={pending}
        onChange={(event) => update(event.target.value as AppLocale)}
        value={locale}
      >
        {(["uz", "ru", "en"] as const).map((item) => (
          <option key={item} value={item}>
            {item.toUpperCase()}
          </option>
        ))}
      </select>
    </label>
  );
}
