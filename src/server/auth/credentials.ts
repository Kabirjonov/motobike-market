import "server-only";

import { verify } from "argon2";

import { AdminAuditAction, AuditOutcome } from "@/generated/prisma/enums";
import { adminLoginSchema } from "@/schemas/auth";
import { writeAdminAudit } from "@/server/auth/audit";
import {
  consumeLoginRateLimit,
  resetLoginRateLimit,
} from "@/server/auth/rate-limit";
import {
  getClientIp,
  getSafeUserAgent,
  hashAuditValue,
} from "@/server/auth/request-context";
import { getPrismaClient } from "@/server/db/client";

const DUMMY_PASSWORD_HASH =
  "$argon2id$v=19$m=19456,p=1,t=2$v5BySpoDguhCh8vfF2IZkg$OBULWHWR9IlyBf79N47IF+7YrIkDwy4v8hsKVjQfvnY";

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must contain at least 32 characters");
  }

  return secret;
}

export async function authorizeAdminCredentials(
  credentials: Partial<Record<"email" | "password", unknown>>,
  request: Request,
) {
  const parsed = adminLoginSchema.safeParse(credentials);

  if (!parsed.success) {
    return null;
  }

  const secret = getAuthSecret();
  const ip = getClientIp(request.headers);
  const identifierHash = hashAuditValue(parsed.data.email, secret);
  const ipHash = ip ? hashAuditValue(ip, secret) : undefined;
  const rateLimitKeys = [
    `email:${identifierHash}`,
    ...(ipHash ? [`ip:${ipHash}`] : []),
  ];
  const auditContext = {
    identifierHash,
    ipHash,
    userAgent: getSafeUserAgent(request.headers),
  };

  const rateLimit = await consumeLoginRateLimit(rateLimitKeys);

  if (!rateLimit.allowed) {
    await writeAdminAudit({
      ...auditContext,
      action: AdminAuditAction.LOGIN_FAILURE,
      metadata: { reason: "rate_limited" },
      outcome: AuditOutcome.FAILURE,
    });
    return null;
  }

  const admin = await getPrismaClient().adminUser.findUnique({
    where: { email: parsed.data.email },
    select: {
      deletedAt: true,
      email: true,
      id: true,
      isActive: true,
      name: true,
      passwordHash: true,
      role: true,
    },
  });

  const passwordMatches = await verify(
    admin?.passwordHash ?? DUMMY_PASSWORD_HASH,
    parsed.data.password,
  ).catch(() => false);

  if (!admin || !passwordMatches || !admin.isActive || admin.deletedAt) {
    await writeAdminAudit({
      ...auditContext,
      action: AdminAuditAction.LOGIN_FAILURE,
      adminUserId: admin?.id,
      metadata: { reason: "invalid_credentials" },
      outcome: AuditOutcome.FAILURE,
    });
    return null;
  }

  await Promise.all([
    resetLoginRateLimit(rateLimitKeys),
    getPrismaClient().adminUser.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    }),
    writeAdminAudit({
      ...auditContext,
      action: AdminAuditAction.LOGIN_SUCCESS,
      adminUserId: admin.id,
      outcome: AuditOutcome.SUCCESS,
    }),
  ]);

  return {
    email: admin.email,
    id: admin.id,
    name: admin.name,
    role: admin.role,
  };
}
