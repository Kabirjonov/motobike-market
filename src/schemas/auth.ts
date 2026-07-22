import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z
    .email()
    .max(254)
    .transform((value) => value.trim().toLowerCase()),
  password: z.string().min(1).max(256),
  redirectTo: z.string().optional(),
});

export function getSafeInternalRedirect(
  value: unknown,
  fallback = "/admin",
): string {
  if (typeof value !== "string" || !value.startsWith("/")) {
    return fallback;
  }

  if (value.startsWith("//") || value.includes("\\")) {
    return fallback;
  }

  try {
    const parsed = new URL(value, "https://internal.invalid");

    if (parsed.origin !== "https://internal.invalid") {
      return fallback;
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}
