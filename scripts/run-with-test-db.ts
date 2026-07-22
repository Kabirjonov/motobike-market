import "dotenv/config";

import { spawnSync } from "node:child_process";

const raw = process.env.TEST_DATABASE_URL;
if (!raw) throw new Error("TEST_DATABASE_URL is required for DB/E2E tests");
const url = new URL(raw);
const database = url.pathname.slice(1);
if (!database.endsWith("_test") || database.length < 6)
  throw new Error(
    "Refusing non-test database: database name must end with _test",
  );
if (
  process.env.DATABASE_URL &&
  new URL(process.env.DATABASE_URL).toString() === url.toString()
)
  throw new Error("TEST_DATABASE_URL must differ from DATABASE_URL");
const [command, ...args] = process.argv.slice(2);
if (!command) throw new Error("A command is required");
const result = spawnSync(command, args, {
  stdio: "inherit",
  env: {
    ...process.env,
    AUTH_SECRET:
      process.env.AUTH_SECRET ?? "qa-auth-secret-at-least-32-characters-long",
    AUTH_URL: process.env.AUTH_URL ?? "http://127.0.0.1:3100",
    DATABASE_URL: url.toString(),
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL ?? "http://127.0.0.1:3100",
    NEXT_SERVER_ACTIONS_ENCRYPTION_KEY:
      process.env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY ??
      "qa-server-actions-encryption-key-32-characters",
    NODE_ENV: command === "playwright" ? "production" : "test",
    SEED_ADMIN_EMAIL: process.env.TEST_ADMIN_EMAIL ?? "qa-admin@example.com",
    SEED_ADMIN_PASSWORD:
      process.env.TEST_ADMIN_PASSWORD ?? "Test-admin-password-2026!",
    STORAGE_DRIVER: process.env.STORAGE_DRIVER ?? "local",
  },
});
process.exit(result.status ?? 1);
