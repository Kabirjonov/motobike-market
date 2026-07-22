import { AdminBreadcrumbs } from "@/features/admin-shell/breadcrumbs";
import { AdminSidebar } from "@/features/admin-shell/sidebar";
import { AdminTopbar } from "@/features/admin-shell/topbar";
import { requireAdminPage } from "@/server/auth/authorization";

export default async function AdminDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const admin = await requireAdminPage("/admin");

  return (
    <div className="bg-muted/40 min-h-screen lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      <AdminSidebar />
      <div className="min-w-0">
        <AdminTopbar admin={admin} />
        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <AdminBreadcrumbs />
          {children}
        </main>
      </div>
    </div>
  );
}
