import "server-only";

import {
  AdminAuditAction,
  AuditOutcome,
  type Prisma,
} from "@/generated/prisma/client";
import { getPrismaClient } from "@/server/db/client";
import { logServerError } from "@/server/observability/logger";

export type AdminAuditInput = Readonly<{
  action: AdminAuditAction;
  adminUserId?: string;
  identifierHash?: string;
  ipHash?: string;
  metadata?: Prisma.InputJsonValue;
  outcome: AuditOutcome;
  userAgent?: string;
}>;

export async function writeAdminAudit(input: AdminAuditInput): Promise<void> {
  try {
    await getPrismaClient().adminAuditLog.create({ data: input });
  } catch (error) {
    logServerError("admin.audit_write_failed", error, {
      action: input.action,
      outcome: input.outcome,
    });
  }
}
