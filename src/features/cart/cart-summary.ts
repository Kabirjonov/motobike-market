import { calculateCartTotal } from "@/server/checkout/money";
import type { CartItem } from "@/stores/cart-store";
export function calculateStoredCartSubtotal(items: CartItem[]) {
  return calculateCartTotal(
    items.map(({ price, quantity }) => ({ price, quantity })),
  );
}
