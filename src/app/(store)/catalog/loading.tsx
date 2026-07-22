export default function CatalogLoading() {
  return (
    <div className="container grid gap-6 py-14">
      <div className="bg-muted h-14 max-w-md animate-pulse rounded-xl" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div
            className="bg-muted aspect-[3/4] animate-pulse rounded-2xl"
            key={index}
          />
        ))}
      </div>
    </div>
  );
}
