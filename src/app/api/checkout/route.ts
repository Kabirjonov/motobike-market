import { revalidateTag } from "next/cache";

import { publicEnv } from "@/lib/env/public";
import { checkoutSchema } from "@/schemas/checkout";
import { consumeRateLimit } from "@/server/auth/rate-limit";
import { getClientIp, hashAuditValue } from "@/server/auth/request-context";
import {
  CheckoutError,
  createCheckoutOrder,
} from "@/server/checkout/order-service";
import { logServerError } from "@/server/observability/logger";
import { isTrustedMutationRequest } from "@/server/security/request";

export async function POST(request: Request) {
  if (!isTrustedMutationRequest(request, publicEnv.NEXT_PUBLIC_APP_URL))
    return Response.json(
      {
        error: {
          code: "FORBIDDEN",
          message: "Request origin yoki content type noto‘g‘ri",
        },
      },
      { status: 403 },
    );
  const ip = getClientIp(request.headers) ?? "unknown";
  const secret = process.env.AUTH_SECRET;
  if (!secret)
    return Response.json(
      {
        error: {
          code: "SERVER_CONFIG",
          message: "Server konfiguratsiyasi noto‘g‘ri",
        },
      },
      { status: 500 },
    );
  const rateLimit = await consumeRateLimit(
    [`checkout:${hashAuditValue(ip, secret)}`],
    {
      attemptLimit: 10,
      windowDurationMs: 10 * 60 * 1000,
      blockDurationMs: 10 * 60 * 1000,
    },
  );
  if (!rateLimit.allowed)
    return Response.json(
      {
        error: {
          code: "RATE_LIMITED",
          message: "Juda ko‘p urinish. Keyinroq qayta urinib ko‘ring.",
        },
      },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      },
    );
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: { code: "INVALID_JSON", message: "JSON body noto‘g‘ri" } },
      { status: 400 },
    );
  }
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success)
    return Response.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Checkout ma’lumotlarini tekshiring",
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
      },
      { status: 422 },
    );
  try {
    const order = await createCheckoutOrder(parsed.data);
    revalidateTag("products", "max");
    return Response.json({ data: order }, { status: 201 });
  } catch (error) {
    if (error instanceof CheckoutError) {
      const status = error.code === "IDEMPOTENCY_CONFLICT" ? 409 : 409;
      return Response.json(
        { error: { code: error.code, message: error.message } },
        { status },
      );
    }
    logServerError("checkout.failed", error);
    return Response.json(
      {
        error: {
          code: "CHECKOUT_FAILED",
          message: "Buyurtma yaratilmadi. Qayta urinib ko‘ring.",
        },
      },
      { status: 500 },
    );
  }
}
