import "server-only";

import { getServerEnv } from "@/server/env";

export type AuthConfig = Readonly<{
  secret: string;
  sessionCookieName: string;
}>;

export function getAuthConfig(): AuthConfig {
  return {
    secret: getServerEnv().AUTH_SECRET,
    sessionCookieName: "motobike_admin_session",
  };
}
