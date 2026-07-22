import "server-only";

import { createHmac } from "node:crypto";

export function getClientIp(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();

  return forwarded || headers.get("x-real-ip")?.trim() || null;
}

export function hashAuditValue(value: string, secret: string): string {
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function getSafeUserAgent(headers: Headers): string | undefined {
  return headers.get("user-agent")?.slice(0, 512) || undefined;
}
