"use server";

import { AuthError } from "next-auth";

import { signIn, signOut } from "@/auth";
import { adminLoginSchema, getSafeInternalRedirect } from "@/schemas/auth";

export type LoginActionState = Readonly<{
  message?: string;
}>;

export async function loginAdmin(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const parsed = adminLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    redirectTo: formData.get("redirectTo"),
  });

  if (!parsed.success) {
    return { message: "Email yoki parol noto‘g‘ri." };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: getSafeInternalRedirect(parsed.data.redirectTo),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { message: "Email yoki parol noto‘g‘ri." };
    }

    throw error;
  }

  return {};
}

export async function logoutAdmin(): Promise<void> {
  await signOut({ redirectTo: "/admin/login" });
}
