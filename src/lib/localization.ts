export function selectLocaleFallback<T extends { locale: string }>(
  items: readonly T[],
  requested: string,
  fallback = "UZ",
) {
  return (
    items.find((item) => item.locale === requested) ??
    items.find((item) => item.locale === fallback) ??
    items[0]
  );
}
