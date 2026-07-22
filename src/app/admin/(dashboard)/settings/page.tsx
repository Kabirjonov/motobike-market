import { Settings } from "lucide-react";

import { AdminSectionPlaceholder } from "@/features/admin-shell/section-placeholder";

export const metadata = { title: "Sozlamalar" };

export default function AdminSettingsPage() {
  return (
    <AdminSectionPlaceholder
      description="Public store konfiguratsiyasi, localization va redirect sozlamalari."
      icon={Settings}
      title="Sozlamalar"
    />
  );
}
