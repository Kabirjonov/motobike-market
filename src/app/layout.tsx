import "./globals.css";

import type { Metadata } from "next";
import { Suspense } from "react";

import { IntlProvider } from "@/components/providers/intl-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

export const metadata: Metadata = {
  description: "Motobike Market",
  title: { default: "Motobike Market", template: "%s | Motobike Market" },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          <Suspense fallback={null}>
            <IntlProvider>{children}</IntlProvider>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
