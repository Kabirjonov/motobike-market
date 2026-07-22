import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/features/admin-auth/login-form";
import { getSafeInternalRedirect } from "@/schemas/auth";
import { getCurrentAdmin } from "@/server/auth/authorization";

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "Admin login",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const admin = await getCurrentAdmin();

  if (admin) {
    redirect("/admin");
  }

  const { redirectTo } = await searchParams;
  const safeRedirect = getSafeInternalRedirect(redirectTo);

  return (
    <main className="container flex min-h-screen items-center justify-center py-12">
      <section
        aria-labelledby="login-title"
        className="border-border bg-card w-full max-w-md rounded-2xl border p-6 shadow-xl sm:p-8"
      >
        <p className="text-primary text-sm font-bold tracking-[0.16em] uppercase">
          Himoyalangan hudud
        </p>
        <h1 className="mt-3 text-3xl font-black" id="login-title">
          Admin login
        </h1>
        <p className="text-muted-foreground mt-3 text-sm leading-6">
          Bu sahifa faqat vakolatli administratorlar uchun. Public akkaunt yoki
          ro‘yxatdan o‘tish mavjud emas.
        </p>
        <AdminLoginForm redirectTo={safeRedirect} />
      </section>
    </main>
  );
}
