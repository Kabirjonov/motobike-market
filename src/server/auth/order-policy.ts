import { AdminRole } from "@/generated/prisma/enums";
import type { AuthorizedAdmin } from "@/server/auth/authorization-policy";

export function canManageOrders(admin: AuthorizedAdmin | null): boolean {
  return (
    admin?.role === AdminRole.SUPER_ADMIN ||
    admin?.role === AdminRole.ORDER_MANAGER
  );
}
