"use server";

import { revalidatePath } from "next/cache";

import { orderTransitionSchema } from "@/schemas/admin-orders";
import { getCurrentAdmin } from "@/server/auth/authorization";
import { canManageOrders } from "@/server/auth/order-policy";
import { transitionAdminOrder } from "@/server/orders/order-transition-service";
import { PaidOrderCancellationError } from "@/server/orders/transition";
import { InvalidOrderStatusTransitionError } from "@/server/services/order-status";

export type OrderActionState = { message: string; success?: boolean };

export async function transitionOrderAction(
  _state: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const admin = await getCurrentAdmin();
  if (!canManageOrders(admin) || !admin)
    return { message: "Bu amal uchun buyurtma boshqaruvchisi huquqi kerak." };
  const parsed = orderTransitionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return {
      message: parsed.error.issues[0]?.message ?? "Ma’lumotlarni tekshiring.",
    };
  try {
    await transitionAdminOrder({ adminId: admin.id, ...parsed.data });
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${parsed.data.orderId}`);
    revalidatePath("/admin");
    return { message: "Status va audit tarixi saqlandi.", success: true };
  } catch (error) {
    if (error instanceof InvalidOrderStatusTransitionError)
      return { message: "Bu status o‘tishiga ruxsat berilmagan." };
    if (error instanceof PaidOrderCancellationError)
      return {
        message: "To‘langan buyurtmani bekor qilishdan oldin refund kerak.",
      };
    return {
      message:
        "Buyurtma o‘zgargan yoki saqlashda xato yuz berdi. Sahifani yangilang.",
    };
  }
}
