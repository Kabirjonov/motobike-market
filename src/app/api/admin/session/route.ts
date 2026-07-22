import { requireAdminApi } from "@/server/auth/authorization";

export async function GET() {
  const authorization = await requireAdminApi();

  if (authorization.response) {
    return authorization.response;
  }

  return Response.json({
    data: {
      email: authorization.admin.email,
      id: authorization.admin.id,
      name: authorization.admin.name,
      role: authorization.admin.role,
    },
  });
}
