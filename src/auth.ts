import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import type { AdminRole } from "@/generated/prisma/enums";
import { AdminAuditAction, AuditOutcome } from "@/generated/prisma/enums";
import { getSafeInternalRedirect } from "@/schemas/auth";
import { writeAdminAudit } from "@/server/auth/audit";
import { authorizeAdminCredentials } from "@/server/auth/credentials";

const isProduction = process.env.NODE_ENV === "production";

export const { auth, handlers, signIn, signOut } = NextAuth({
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      return token;
    },
    redirect({ baseUrl, url }) {
      const target = url.startsWith(baseUrl) ? url.slice(baseUrl.length) : url;
      return `${baseUrl}${getSafeInternalRedirect(target)}`;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as AdminRole;
      return session;
    },
  },
  cookies: {
    sessionToken: {
      name: isProduction
        ? "__Secure-motobike.admin-session"
        : "motobike.admin-session",
      options: {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: isProduction,
      },
    },
  },
  events: {
    async signOut(message) {
      const adminUserId = "token" in message ? message.token?.id : undefined;

      await writeAdminAudit({
        action: AdminAuditAction.LOGOUT,
        adminUserId: typeof adminUserId === "string" ? adminUserId : undefined,
        outcome: AuditOutcome.SUCCESS,
      });
    },
  },
  pages: {
    error: "/admin/login",
    signIn: "/admin/login",
  },
  providers: [
    Credentials({
      authorize: authorizeAdminCredentials,
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
  session: {
    maxAge: 8 * 60 * 60,
    strategy: "jwt",
    updateAge: 60 * 60,
  },
});
