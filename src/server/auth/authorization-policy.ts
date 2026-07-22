import type { Session } from "next-auth";

export type AuthorizedAdmin = Readonly<{
  email: string;
  id: string;
  name: string;
  role: Session["user"]["role"];
}>;

export type AdminLookup = (
  id: string,
) => Promise<
  (AuthorizedAdmin & { deletedAt: Date | null; isActive: boolean }) | null
>;

export async function resolveAuthorizedAdmin(
  session: Session | null,
  lookup: AdminLookup,
  now = new Date(),
): Promise<AuthorizedAdmin | null> {
  if (
    !session?.user?.id ||
    !session.expires ||
    new Date(session.expires) <= now
  ) {
    return null;
  }

  const admin = await lookup(session.user.id);

  if (!admin?.isActive || admin.deletedAt) {
    return null;
  }

  return {
    email: admin.email,
    id: admin.id,
    name: admin.name,
    role: admin.role,
  };
}
