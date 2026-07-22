export default function Loading() {
  return (
    <div aria-busy="true" aria-live="polite" className="container py-16">
      <span className="sr-only">Sahifa yuklanmoqda</span>
      <div className="bg-muted h-8 w-2/3 animate-pulse rounded-md sm:w-1/3" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            className="border-border bg-muted h-40 animate-pulse rounded-xl border"
            key={index}
          />
        ))}
      </div>
    </div>
  );
}
