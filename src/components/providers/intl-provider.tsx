import { connection } from "next/server";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

import { HtmlLocale } from "./locale-document";

export async function IntlProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      timeZone="Asia/Tashkent"
    >
      <HtmlLocale locale={locale} />
      {children}
    </NextIntlClientProvider>
  );
}
