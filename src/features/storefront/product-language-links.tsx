"use client";

import { StoreLocaleSwitcher } from "./locale";

export function ProductLanguageLinks({
  translations,
  preview,
}: {
  translations: { locale: "UZ" | "RU" | "EN"; slug: string }[];
  preview: boolean;
}) {
  const suffix = preview ? "?preview=1" : "";
  const localizedPaths = Object.fromEntries(
    translations.map((item) => [
      item.locale.toLowerCase(),
      `/products/${item.slug}${suffix}`,
    ]),
  );
  return (
    <nav aria-label="Mahsulot tili">
      <StoreLocaleSwitcher localizedPaths={localizedPaths} variant="buttons" />
    </nav>
  );
}
