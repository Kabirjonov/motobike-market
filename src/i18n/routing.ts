import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["uz", "ru", "en"],
  defaultLocale: "uz",
  localePrefix: "always",
  localeDetection: false,
});

export type AppLocale = (typeof routing.locales)[number];

export function isAppLocale(value: string): value is AppLocale {
  return routing.locales.includes(value as AppLocale);
}

export function localePath(locale: AppLocale, pathname: string) {
  const clean = pathname.replace(/^\/(uz|ru|en)(?=\/|$)/, "") || "/";
  return `/${locale}${clean === "/" ? "" : clean}`;
}
