import { describe, expect, it } from "vitest";

import { checkoutSchema } from "@/schemas/checkout";
import { calculateCartTotal } from "@/server/checkout/money";
import {
  reserveStockLines,
  StockReservationError,
} from "@/server/checkout/stock-reservation";
const base = {
  idempotencyKey: "7dbdb4e4-51c6-4d5c-9fe5-3ba0b6f8e400",
  customerName: "Ali Valiyev",
  phone: "+998 90 123 45 67",
  email: "",
  region: "Toshkent",
  city: "Toshkent",
  addressLine: "Amir Temur ko‘chasi 10",
  deliveryMethod: "COURIER",
  paymentMethod: "CASH_ON_DELIVERY",
  items: [{ productId: "cm12345678901234567890123", quantity: 2 }],
};
describe("checkout security and calculations", () => {
  it("calculates exact decimal totals", () =>
    expect(
      calculateCartTotal([
        { price: "100.10", quantity: 3 },
        { price: "0.20", quantity: 2 },
      ]),
    ).toBe("300.70"));
  it("normalizes Uzbekistan phones", () =>
    expect(checkoutSchema.parse(base).phone).toBe("+998901234567"));
  it("rejects client price tampering", () =>
    expect(
      checkoutSchema.safeParse({
        ...base,
        items: [{ ...base.items[0], price: "1.00" }],
      }).success,
    ).toBe(false));
  it("rejects insufficient stock", async () => {
    await expect(
      reserveStockLines([{ productId: "p1", quantity: 2 }], async () => false),
    ).rejects.toBeInstanceOf(StockReservationError);
  });
  it("allows only one concurrent reservation", async () => {
    let stock = 1;
    const reserve = async ({
      quantity,
    }: {
      productId: string;
      quantity: number;
    }) => {
      if (stock < quantity) return false;
      stock -= quantity;
      return true;
    };
    const attempts = await Promise.allSettled([
      reserveStockLines([{ productId: "p1", quantity: 1 }], reserve),
      reserveStockLines([{ productId: "p1", quantity: 1 }], reserve),
    ]);
    expect(
      attempts.filter(({ status }) => status === "fulfilled"),
    ).toHaveLength(1);
    expect(stock).toBe(0);
  });
});
