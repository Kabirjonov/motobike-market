export type RateLimitDecision = Readonly<{
  allowed: boolean;
  retryAfterSeconds: number;
}>;

export function toRateLimitDecision(
  blockedUntil: Date | null,
  now: Date,
): RateLimitDecision {
  if (!blockedUntil || blockedUntil <= now) {
    return { allowed: true, retryAfterSeconds: 0 };
  }

  return {
    allowed: false,
    retryAfterSeconds: Math.max(
      1,
      Math.ceil((blockedUntil.getTime() - now.getTime()) / 1000),
    ),
  };
}
