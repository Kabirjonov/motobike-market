export class StockReservationError extends Error {}
export async function reserveStockLines<
  T extends { productId: string; quantity: number },
>(lines: T[], reserve: (line: T) => Promise<boolean>) {
  for (const line of lines)
    if (!(await reserve(line))) throw new StockReservationError(line.productId);
}
