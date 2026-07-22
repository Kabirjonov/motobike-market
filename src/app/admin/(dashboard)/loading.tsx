export default function AdminDashboardLoading() {
  return (
    <div aria-busy="true" aria-live="polite" className="space-y-8">
      <span className="sr-only">Dashboard yuklanmoqda</span>
      <div>
        <div className="bg-muted h-4 w-36 animate-pulse rounded" />
        <div className="bg-muted mt-3 h-9 w-56 animate-pulse rounded" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            className="bg-card h-40 animate-pulse rounded-xl border"
            key={index}
          />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="bg-card h-96 animate-pulse rounded-xl border" />
        <div className="bg-card h-96 animate-pulse rounded-xl border" />
      </div>
    </div>
  );
}
