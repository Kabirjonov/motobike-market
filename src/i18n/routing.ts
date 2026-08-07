import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["uz", "ru", "en"],
  defaultLocale: "uz",
  localePrefix: "never",
  localeDetection: false,
});

export type AppLocale = (typeof routing.locales)[number];

export function isAppLocale(value: string): value is AppLocale {
  return routing.locales.includes(value as AppLocale);
}

export function localePath(_locale: AppLocale, pathname: string) {
  return pathname.replace(/^\/(uz|ru|en)(?=\/|$)/, "") || "/";
}
