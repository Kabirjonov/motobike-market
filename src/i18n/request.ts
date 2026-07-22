import { headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";

import { type AppLocale, isAppLocale } from "./routing";

export default getRequestConfig(async () => {
  const requested = (await headers()).get("x-motobike-locale") ?? "uz";
  const locale: AppLocale = isAppLocale(requested) ? requested : "uz";
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    timeZone: "Asia/Tashkent",
  };
});
