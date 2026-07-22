import "server-only";

import { Prisma } from "@/generated/prisma/client";
import {
  type RateLimitDecision,
  toRateLimitDecision,
} from "@/server/auth/rate-limit-policy";
import { getPrismaClient } from "@/server/db/client";

type RateLimitPolicy = {
  attemptLimit: number;
  blockDurationMs: number;
  windowDurationMs: number;
};
const loginPolicy: RateLimitPolicy = {
  attemptLimit: 5,
  blockDurationMs: 15 * 60 * 1000,
  windowDurationMs: 15 * 60 * 1000,
};

type RateLimitRow = {
  blockedUntil: Date | null;
};

async function consumeKey(
  key: string,
  now: Date,
  policy: RateLimitPolicy,
): Promise<RateLimitDecision> {
  const db = getPrismaClient();
  const windowCutoff = new Date(now.getTime() - policy.windowDurationMs);
  const nextBlockedUntil = new Date(now.getTime() + policy.blockDurationMs);

  const rows = await db.$queryRaw<RateLimitRow[]>(Prisma.sql`
    INSERT INTO "AuthRateLimit" (
      "id", "key", "attempts", "windowStartedAt", "updatedAt"
    ) VALUES (
      ${crypto.randomUUID()}, ${key}, 1, ${now}, ${now}
    )
    ON CONFLICT ("key") DO UPDATE SET
      "attempts" = CASE
        WHEN "AuthRateLimit"."blockedUntil" > ${now}
          THEN "AuthRateLimit"."attempts"
        WHEN "AuthRateLimit"."windowStartedAt" <= ${windowCutoff}
          THEN 1
        ELSE "AuthRateLimit"."attempts" + 1
      END,
      "windowStartedAt" = CASE
        WHEN "AuthRateLimit"."blockedUntil" > ${now}
          THEN "AuthRateLimit"."windowStartedAt"
        WHEN "AuthRateLimit"."windowStartedAt" <= ${windowCutoff}
          THEN ${now}
        ELSE "AuthRateLimit"."windowStartedAt"
      END,
      "blockedUntil" = CASE
        WHEN "AuthRateLimit"."blockedUntil" > ${now}
          THEN "AuthRateLimit"."blockedUntil"
        WHEN "AuthRateLimit"."windowStartedAt" > ${windowCutoff}
          AND "AuthRateLimit"."attempts" + 1 >= ${policy.attemptLimit}
          THEN ${nextBlockedUntil}
        ELSE NULL
      END,
      "updatedAt" = ${now}
    RETURNING "blockedUntil"
  `);

  return toRateLimitDecision(rows[0]?.blockedUntil ?? null, now);
}

export async function consumeLoginRateLimit(
  keys: readonly string[],
  now = new Date(),
): Promise<RateLimitDecision> {
  return consumeRateLimit(keys, loginPolicy, now);
}

export async function consumeRateLimit(
  keys: readonly string[],
  policy: RateLimitPolicy,
  now = new Date(),
): Promise<RateLimitDecision> {
  const decisions = await Promise.all(
    keys.map((key) => consumeKey(key, now, policy)),
  );
  const retryAfterSeconds = Math.max(
    0,
    ...decisions.map((decision) => decision.retryAfterSeconds),
  );

  return {
    allowed: decisions.every((decision) => decision.allowed),
    retryAfterSeconds,
  };
}

export async function resetLoginRateLimit(keys: readonly string[]) {
  await getPrismaClient().authRateLimit.deleteMany({
    where: { key: { in: [...keys] } },
  });
}
