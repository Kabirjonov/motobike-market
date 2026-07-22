export function formatDecimalMoney(amount: string, currency: string): string {
  const match = /^(-?)(\d+)(?:\.(\d+))?$/.exec(amount);

  if (!match) {
    return `${amount} ${currency}`;
  }

  const sign = match[1] === "-" ? "-" : "";
  const whole = new Intl.NumberFormat("uz-UZ").format(BigInt(match[2] ?? "0"));
  const fraction = (match[3] ?? "").replace(/0+$/, "");

  return `${sign}${whole}${fraction ? `,${fraction}` : ""} ${currency}`;
}

export function formatAdminDate(date: Date): string {
  return new Intl.DateTimeFormat("uz-UZ", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Tashkent",
  }).format(date);
}
