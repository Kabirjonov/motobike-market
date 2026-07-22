import "server-only";

import { getPrismaClient } from "@/server/db/client";

export function findActiveRedirect(sourcePath: string) {
  return getPrismaClient().redirect.findFirst({
    where: {
      sourcePath,
      isActive: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    select: { destinationPath: true, statusCode: true },
  });
}
