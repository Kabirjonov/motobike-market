import "server-only";

import { databaseEnvSchema } from "@/schemas/env";

export type DatabaseConfig = Readonly<{
  url: string;
}>;

export function getDatabaseConfig(): DatabaseConfig {
  return {
    url: databaseEnvSchema.parse({ DATABASE_URL: process.env.DATABASE_URL })
      .DATABASE_URL,
  };
}
