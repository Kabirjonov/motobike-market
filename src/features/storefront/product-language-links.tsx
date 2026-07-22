"use client";

import Link from "next/link";
import { useLocale } from "next-intl";

export function ProductLanguageLinks({
  translations,
  preview,
}: {
  translations: { locale: "UZ" | "RU" | "EN"; slug: string }[];
  preview: boolean;
}) {
  const locale = useLocale();
  return (
    <nav aria-label="Mahsulot tili" className="flex gap-1">
      {translations.map((item) => {
        const lang = item.locale.toLowerCase();
        const params = new URLSearchParams();
        if (preview) params.set("preview", "1");
        const query = params.toString();
        return (
          <Link
            aria-current={locale === lang ? "page" : undefined}
            className="aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground rounded-md border px-2 py-1 text-xs font-bold"
            href={`/${lang}/products/${item.slug}${query ? `?${query}` : ""}`}
            key={item.locale}
          >
            {item.locale}
          </Link>
        );
      })}
    </nav>
  );
}
