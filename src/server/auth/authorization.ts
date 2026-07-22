import "server-only";

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AdminAuditAction, AuditOutcome } from "@/generated/prisma/enums";
import { getSafeInternalRedirect } from "@/schemas/auth";
import { writeAdminAudit } from "@/server/auth/audit";
import {
  type AuthorizedAdmin,
  resolveAuthorizedAdmin,
} from "@/server/auth/authorization-policy";
import { getPrismaClient } from "@/server/db/client";

async function lookupAdmin(id: string) {
  return getPrismaClient().adminUser.findUnique({
    where: { id },
    select: {
      deletedAt: true,
      email: true,
      id: true,
      isActive: true,
      name: true,
      role: true,
    },
  });
}

export async function getCurrentAdmin(): Promise<AuthorizedAdmin | null> {
  return resolveAuthorizedAdmin(await auth(), lookupAdmin);
}

export async function requireAdminPage(
  redirectTo = "/admin",
): Promise<AuthorizedAdmin> {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect(
      `/admin/login?redirectTo=${encodeURIComponent(getSafeInternalRedirect(redirectTo))}`,
    );
  }

  return admin;
}

export async function requireAdminApi(): Promise<
  | { admin: AuthorizedAdmin; response?: never }
  | { admin?: never; response: Response }
> {
  const session = await auth();
  const admin = await resolveAuthorizedAdmin(session, lookupAdmin);

  if (admin) {
    return { admin };
  }

  await writeAdminAudit({
    action: AdminAuditAction.PROTECTED_ACCESS_DENIED,
    adminUserId: session?.user?.id,
    outcome: AuditOutcome.FAILURE,
  });

  return {
    response: Response.json(
      { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
      { status: 401 },
    ),
  };
}
