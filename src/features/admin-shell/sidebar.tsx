import { AdminBrand, AdminNavigation } from "./navigation";

export function AdminSidebar() {
  return (
    <aside className="border-border bg-card sticky top-0 hidden h-screen border-r lg:flex lg:flex-col">
      <div className="border-border flex h-18 items-center border-b px-5">
        <AdminBrand />
      </div>
      <AdminNavigation className="flex-1 overflow-y-auto p-4" />
      <div className="border-border text-muted-foreground border-t p-4 text-xs leading-5">
        <p>Motobike Market</p>
        <p>Production admin console</p>
      </div>
    </aside>
  );
}
