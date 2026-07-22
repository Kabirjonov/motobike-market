export function decimalToMinor(value: string) {
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(value);
  if (!match) throw new Error("Invalid money");
  return (
    BigInt(match[1] ?? "0") * BigInt(100) +
    BigInt((match[2] ?? "").padEnd(2, "0"))
  );
}
export function minorToDecimal(value: bigint) {
  const whole = value / BigInt(100);
  const fraction = (value % BigInt(100)).toString().padStart(2, "0");
  return `${whole}.${fraction}`;
}
export function calculateCartTotal(
  items: { price: string; quantity: number }[],
) {
  return minorToDecimal(
    items.reduce(
      (sum, item) => sum + decimalToMinor(item.price) * BigInt(item.quantity),
      BigInt(0),
    ),
  );
}
