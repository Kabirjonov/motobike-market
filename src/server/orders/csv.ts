const dangerousPrefix = /^[=+\-@\t\r]/;

export function escapeCsvCell(value: unknown): string {
  let text = value == null ? "" : String(value);
  if (dangerousPrefix.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export function rowsToCsv(rows: readonly (readonly unknown[])[]) {
  return `\uFEFF${rows.map((row) => row.map(escapeCsvCell).join(",")).join("\r\n")}\r\n`;
}

export function safePhoneHref(phone: string) {
  return /^\+?[1-9]\d{7,14}$/.test(phone) ? `tel:${phone}` : undefined;
}

export function safeEmailHref(email: string | null) {
  return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ? `mailto:${email}`
    : undefined;
}
