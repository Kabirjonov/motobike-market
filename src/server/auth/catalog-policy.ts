import { AdminRole } from "@/generated/prisma/enums";
import type { AuthorizedAdmin } from "@/server/auth/authorization-policy";

export function canManageCatalog(admin: AuthorizedAdmin | null) {
  return (
    admin?.role === AdminRole.SUPER_ADMIN ||
    admin?.role === AdminRole.CATALOG_MANAGER
  );
}
